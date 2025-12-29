import connectToDatabase from "@/lib/db/firestore";
import { Collection, Db, ObjectId } from "mongodb";
import type { InvoiceFormValues } from "@/app/(protected)/facturas/invoice-form";
import type { InvoiceItem, InvoiceDocument } from "@/lib/types/invoice.types";
import type { ClientSnapshot } from "@/lib/types/client.types";
import clientService from "./client.service";

class InvoiceService {
	private getCollection(db: Db): Collection<InvoiceDocument> {
		return db.collection<InvoiceDocument>("invoices");
	}

	/**
	 * Calculate invoice totals
	 */
	private calculateTotals(items: InvoiceItem[]): {
		subtotal: number;
		tax: number;
		total: number;
	} {
		const subtotal = items.reduce(
			(sum, item) => sum + item.quantity * item.unitPrice,
			0,
		);

		const tax = items.reduce((sum, item) => {
			const itemSubtotal = item.quantity * item.unitPrice;
			const taxRate = parseFloat(item.taxRate);
			return sum + (itemSubtotal * taxRate) / 100;
		}, 0);

		const total = subtotal + tax;

		return {
			subtotal: Math.round(subtotal * 100) / 100,
			tax: Math.round(tax * 100) / 100,
			total: Math.round(total * 100) / 100,
		};
	}

	/**
	 * Create a new invoice
	 * If clientId is not provided but client data exists, create the client first
	 */
	async createInvoice(
		data: InvoiceFormValues,
	): Promise<InvoiceDocument> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const totals = this.calculateTotals(data.items);

		// Auto-create or update client
		let finalClientId = data.clientId;
		
		// If clientId exists, try to update it with any additional data
		if (data.clientId) {
			try {
				const existingClient = await clientService.getClientById(data.clientId);
				if (existingClient) {
					// Check if form has more data than the client
					const needsUpdate =
						(data.clientTaxId && !existingClient.taxId) ||
						(data.clientTaxCondition && !existingClient.taxCondition) ||
						(data.clientAddress && !existingClient.address) ||
						(data.clientTaxId && data.clientTaxId !== existingClient.taxId) ||
						(data.clientTaxCondition && data.clientTaxCondition !== existingClient.taxCondition) ||
						(data.clientAddress && data.clientAddress !== existingClient.address);

					if (needsUpdate) {
						// Update client with additional data
						await clientService.updateClient(data.clientId, {
							taxId: data.clientTaxId?.trim() || existingClient.taxId,
							taxCondition: data.clientTaxCondition || existingClient.taxCondition,
							address: data.clientAddress?.trim() || existingClient.address,
						});
					}
				}
			} catch (error) {
				console.error("Error updating client:", error);
				// Continue even if update fails
			}
		}
		
		// Auto-create client if not selected but data is provided
		if (!data.clientId && data.clientName && data.clientName.trim().length > 0) {
			try {
				// Check if client already exists by name or taxId
				const existingClients = await clientService.searchClients(data.clientName);
				let existingClient = existingClients.find(
					(c) => c.name.toLowerCase() === data.clientName.toLowerCase(),
				);

				// Also check by taxId if provided
				if (!existingClient && data.clientTaxId) {
					const clientsByTaxId = await clientService.searchClients(data.clientTaxId);
					existingClient = clientsByTaxId.find(
						(c) => c.taxId === data.clientTaxId,
					);
				}

				if (existingClient) {
					// Use existing client and update if needed
					finalClientId = existingClient._id as string;
					// Update with any additional data
					const needsUpdate =
						(data.clientTaxId && data.clientTaxId !== existingClient.taxId) ||
						(data.clientTaxCondition && data.clientTaxCondition !== existingClient.taxCondition) ||
						(data.clientAddress && data.clientAddress !== existingClient.address);

					if (needsUpdate) {
						await clientService.updateClient(finalClientId, {
							taxId: data.clientTaxId?.trim() || existingClient.taxId,
							taxCondition: data.clientTaxCondition || existingClient.taxCondition,
							address: data.clientAddress?.trim() || existingClient.address,
						});
					}
				} else {
					// Create new client with all data including address
					const newClient = await clientService.createClient({
						name: data.clientName.trim(),
						taxId: data.clientTaxId?.trim() || undefined,
						taxCondition: data.clientTaxCondition || undefined,
						address: data.clientAddress?.trim() || undefined,
					});
					finalClientId = newClient._id as string;
				}
			} catch (error) {
				console.error("Error creating client automatically:", error);
				// Continue without clientId if creation fails
			}
		}

		// Create client snapshot
		const clientSnapshot: ClientSnapshot = {
			clientId: finalClientId,
			name: data.clientName,
			taxId: data.clientTaxId,
			taxCondition: data.clientTaxCondition,
			address: data.clientAddress,
		};

		const document: Omit<InvoiceDocument, "_id" | "createdAt" | "updatedAt"> = {
			invoiceType: data.invoiceType,
			pointOfSale: data.pointOfSale,
			invoiceNumber: data.invoiceNumber,
			date: data.date,
			// Client reference and snapshot
			clientId: finalClientId,
			client: clientSnapshot,
			// Legacy fields (for backward compatibility)
			clientName: data.clientName,
			clientTaxId: data.clientTaxId,
			clientTaxCondition: data.clientTaxCondition,
			clientAddress: data.clientAddress,
			items: data.items,
			paymentCondition: data.paymentCondition,
			subtotal: totals.subtotal,
			tax: totals.tax,
			total: totals.total,
		};

		const documentWithDates: Omit<InvoiceDocument, "_id"> = {
			...document,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await collection.insertOne(documentWithDates as InvoiceDocument);

		return {
			_id: result.insertedId.toString(),
			...documentWithDates,
		};
	}

	/**
	 * Get all invoices
	 */
	async getAllInvoices(): Promise<InvoiceDocument[]> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const documents = await collection
			.find({})
			.sort({ createdAt: -1 })
			.toArray();

		return documents.map((doc) => ({
			...doc,
			_id: doc._id.toString(),
		}));
	}

	/**
	 * Get an invoice by ID
	 */
	async getInvoiceById(id: string): Promise<InvoiceDocument | null> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		let objectId: ObjectId;
		try {
			objectId = new ObjectId(id);
		} catch {
			return null;
		}

		const document = await collection.findOne({ _id: objectId });

		if (!document) {
			return null;
		}

		return {
			...document,
			_id: document._id.toString(),
		};
	}

	/**
	 * Update an invoice
	 */
	async updateInvoice(
		id: string,
		data: Partial<Omit<InvoiceDocument, "_id" | "createdAt">>,
	): Promise<InvoiceDocument | null> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		let objectId: ObjectId;
		try {
			objectId = new ObjectId(id);
		} catch {
			return null;
		}

		// Recalculate totals if items are being updated
		if (data.items) {
			const totals = this.calculateTotals(data.items);
			data.subtotal = totals.subtotal;
			data.tax = totals.tax;
			data.total = totals.total;
		}

		const updateData = {
			...data,
			updatedAt: new Date(),
		};

		const result = await collection.findOneAndUpdate(
			{ _id: objectId },
			{ $set: updateData },
			{ returnDocument: "after" },
		);

		if (!result) {
			return null;
		}

		return {
			...result,
			_id: result._id.toString(),
		};
	}

	/**
	 * Delete an invoice
	 */
	async deleteInvoice(id: string): Promise<boolean> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		let objectId: ObjectId;
		try {
			objectId = new ObjectId(id);
		} catch {
			return false;
		}

		const result = await collection.deleteOne({ _id: objectId });
		return result.deletedCount > 0;
	}

	/**
	 * Get invoices by date range
	 */
	async getInvoicesByDateRange(
		startDate: string,
		endDate: string,
	): Promise<InvoiceDocument[]> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const documents = await collection
			.find({
				date: {
					$gte: startDate,
					$lte: endDate,
				},
			})
			.sort({ date: -1 })
			.toArray();

		return documents.map((doc) => ({
			...doc,
			_id: doc._id.toString(),
		}));
	}

	/**
	 * Get invoices by type
	 */
	async getInvoicesByType(
		type: "A" | "B" | "C" | "Unbilled",
	): Promise<InvoiceDocument[]> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const documents = await collection
			.find({ invoiceType: type })
			.sort({ createdAt: -1 })
			.toArray();

		return documents.map((doc) => ({
			...doc,
			_id: doc._id.toString(),
		}));
	}
}

const invoiceService = new InvoiceService();
export default invoiceService;

