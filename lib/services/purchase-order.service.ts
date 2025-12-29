import connectToDatabase from "@/lib/db/firestore";
import { Collection, Db, ObjectId } from "mongodb";
import type {
	PurchaseOrderFormValues,
} from "@/lib/schemas/purchase-order.schemas";
import type { PurchaseOrderDocument } from "@/lib/types/purchase-order.types";
import type { SupplierSnapshot } from "@/lib/types/supplier.types";
import type { Item } from "@/lib/schemas/item.schemas";
import supplierService from "./supplier.service";

class PurchaseOrderService {
	private getCollection(db: Db): Collection<PurchaseOrderDocument> {
		return db.collection<PurchaseOrderDocument>("purchaseOrders");
	}

	/**
	 * Calculate purchase order totals using shared calculation logic
	 */
	private calculateTotals(items: Item[]): {
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
	 * Create a new purchase order
	 * If supplierId is not provided but supplier data exists, create the supplier first
	 */
	async createPurchaseOrder(
		data: PurchaseOrderFormValues,
	): Promise<PurchaseOrderDocument> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const totals = this.calculateTotals(data.items);

		// Auto-create or update supplier
		let finalSupplierId = data.supplierId;

		// If supplierId exists, try to update it with any additional data
		if (data.supplierId) {
			try {
				const existingSupplier =
					await supplierService.getSupplierById(data.supplierId);
				if (existingSupplier) {
					const needsUpdate =
						(data.supplierTaxId && !existingSupplier.taxId) ||
						(data.supplierTaxCondition && !existingSupplier.taxCondition) ||
						(data.supplierAddress && !existingSupplier.address) ||
						(data.supplierTaxId &&
							data.supplierTaxId !== existingSupplier.taxId) ||
						(data.supplierTaxCondition &&
							data.supplierTaxCondition !== existingSupplier.taxCondition) ||
						(data.supplierAddress &&
							data.supplierAddress !== existingSupplier.address);

					if (needsUpdate) {
						await supplierService.updateSupplier(data.supplierId, {
							taxId: data.supplierTaxId?.trim() || existingSupplier.taxId,
							taxCondition:
								data.supplierTaxCondition || existingSupplier.taxCondition,
							address: data.supplierAddress?.trim() || existingSupplier.address,
						});
					}
				}
			} catch (error) {
				console.error("Error updating supplier:", error);
			}
		}

		// Auto-create supplier if not selected but data is provided
		if (
			!data.supplierId &&
			data.supplierName &&
			data.supplierName.trim().length > 0
		) {
			try {
				const existingSuppliers =
					await supplierService.searchSuppliers(data.supplierName);
				let existingSupplier = existingSuppliers.find(
					(s) => s.name.toLowerCase() === data.supplierName.toLowerCase(),
				);

				if (!existingSupplier && data.supplierTaxId) {
					const suppliersByTaxId =
						await supplierService.searchSuppliers(data.supplierTaxId);
					existingSupplier = suppliersByTaxId.find(
						(s) => s.taxId === data.supplierTaxId,
					);
				}

				if (existingSupplier) {
					finalSupplierId = existingSupplier._id as string;
				} else {
					const newSupplier = await supplierService.createSupplier({
						name: data.supplierName.trim(),
						taxId: data.supplierTaxId?.trim() || undefined,
						taxCondition: data.supplierTaxCondition || undefined,
						address: data.supplierAddress?.trim() || undefined,
					});
					finalSupplierId = newSupplier._id as string;
				}
			} catch (error) {
				console.error("Error auto-creating supplier:", error);
			}
		}

		// Create supplier snapshot
		const supplierSnapshot: SupplierSnapshot = {
			supplierId: finalSupplierId,
			name: data.supplierName.trim(),
			taxId: data.supplierTaxId?.trim() || undefined,
			taxCondition: data.supplierTaxCondition || undefined,
			address: data.supplierAddress?.trim() || undefined,
		};

		// Create purchase order document
		const purchaseOrderDoc: Omit<PurchaseOrderDocument, "_id"> = {
			orderNumber: data.orderNumber.trim(),
			date: data.date,
			supplierId: finalSupplierId,
			supplier: supplierSnapshot,
			// Legacy fields for backward compatibility
			supplierName: supplierSnapshot.name,
			supplierTaxId: supplierSnapshot.taxId,
			supplierTaxCondition: supplierSnapshot.taxCondition,
			supplierAddress: supplierSnapshot.address,
			items: data.items,
			paymentCondition: data.paymentCondition,
			deliveryDate: data.deliveryDate || undefined,
			notes: data.notes || undefined,
			subtotal: totals.subtotal,
			tax: totals.tax,
			total: totals.total,
			status: data.status || "Pendiente",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const result = await collection.insertOne(
			purchaseOrderDoc as PurchaseOrderDocument,
		);

		return {
			_id: result.insertedId.toString(),
			...purchaseOrderDoc,
		};
	}

	/**
	 * Get all purchase orders
	 */
	async getAllPurchaseOrders(): Promise<PurchaseOrderDocument[]> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		const documents = await collection
			.find({})
			.sort({ date: -1, createdAt: -1 })
			.toArray();

		return documents.map((doc) => ({
			...doc,
			_id: doc._id.toString(),
		}));
	}

	/**
	 * Get a purchase order by ID
	 */
	async getPurchaseOrderById(
		id: string,
	): Promise<PurchaseOrderDocument | null> {
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
	 * Update a purchase order
	 */
	async updatePurchaseOrder(
		id: string,
		data: Partial<Omit<PurchaseOrderDocument, "_id" | "createdAt">>,
	): Promise<PurchaseOrderDocument | null> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		let objectId: ObjectId;
		try {
			objectId = new ObjectId(id);
		} catch {
			return null;
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
	 * Delete a purchase order
	 */
	async deletePurchaseOrder(id: string): Promise<boolean> {
		const { db } = await connectToDatabase();
		const collection = this.getCollection(db);

		let objectId: ObjectId;
		try {
			objectId = new ObjectId(id);
		} catch {
			return false;
		}

		const result = await collection.deleteOne({ _id: objectId });

		return result.deletedCount === 1;
	}

	/**
	 * Update purchase order status
	 */
	async updatePurchaseOrderStatus(
		id: string,
		status: PurchaseOrderDocument["status"],
	): Promise<PurchaseOrderDocument | null> {
		return this.updatePurchaseOrder(id, { status });
	}
}

const purchaseOrderService = new PurchaseOrderService();
export default purchaseOrderService;


