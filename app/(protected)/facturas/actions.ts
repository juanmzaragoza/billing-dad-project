"use server";

import { revalidatePath } from "next/cache";
import invoiceService from "@/lib/services/invoice.service";
import type { InvoiceFormValues } from "./invoice-form";
import type { InvoiceDocument } from "@/lib/types/invoice.types";

/**
 * Server Actions for invoices
 * These run on the server and can be called directly from client components
 */

export async function createInvoice(
	data: InvoiceFormValues,
): Promise<InvoiceDocument> {
	try {
		const invoice = await invoiceService.createInvoice(data);
		revalidatePath("/facturas");
		return invoice;
	} catch (error) {
		console.error("Error creating invoice:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al crear la factura",
		);
	}
}

export async function getAllInvoices(): Promise<InvoiceDocument[]> {
	try {
		return await invoiceService.getAllInvoices();
	} catch (error) {
		console.error("Error fetching invoices:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al obtener las facturas",
		);
	}
}

export async function getInvoicesByType(
	type: "A" | "B" | "C" | "Unbilled",
): Promise<InvoiceDocument[]> {
	try {
		return await invoiceService.getInvoicesByType(type);
	} catch (error) {
		console.error("Error fetching invoices by type:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al obtener las facturas",
		);
	}
}

export async function getInvoicesByDateRange(
	startDate: string,
	endDate: string,
): Promise<InvoiceDocument[]> {
	try {
		return await invoiceService.getInvoicesByDateRange(startDate, endDate);
	} catch (error) {
		console.error("Error fetching invoices by date range:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al obtener las facturas",
		);
	}
}

export async function getInvoiceById(id: string): Promise<InvoiceDocument | null> {
	try {
		return await invoiceService.getInvoiceById(id);
	} catch (error) {
		console.error("Error fetching invoice:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al obtener la factura",
		);
	}
}

export async function updateInvoice(
	id: string,
	data: Partial<Omit<InvoiceDocument, "_id" | "createdAt">>,
): Promise<InvoiceDocument> {
	try {
		const invoice = await invoiceService.updateInvoice(id, data);
		if (!invoice) {
			throw new Error("Factura no encontrada");
		}
		revalidatePath("/facturas");
		return invoice;
	} catch (error) {
		console.error("Error updating invoice:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al actualizar la factura",
		);
	}
}

/**
 * Update invoice from form values
 */
export async function updateInvoiceFromForm(
	id: string,
	data: Partial<InvoiceFormValues>,
): Promise<InvoiceDocument> {
	try {
		// Convert form values to document structure
		const updateData: Partial<Omit<InvoiceDocument, "_id" | "createdAt">> = {
			invoiceType: data.invoiceType,
			pointOfSale: data.pointOfSale,
			invoiceNumber: data.invoiceNumber,
			date: data.date,
			clientId: data.clientId,
			clientName: data.clientName,
			clientTaxId: data.clientTaxId,
			clientTaxCondition: data.clientTaxCondition,
			clientAddress: data.clientAddress,
			items: data.items as InvoiceDocument["items"],
			paymentCondition: data.paymentCondition,
		};

		return await updateInvoice(id, updateData);
	} catch (error) {
		console.error("Error updating invoice from form:", error);
		throw error;
	}
}

export async function deleteInvoice(id: string): Promise<void> {
	try {
		const deleted = await invoiceService.deleteInvoice(id);
		if (!deleted) {
			throw new Error("Factura no encontrada");
		}
		revalidatePath("/facturas");
	} catch (error) {
		console.error("Error deleting invoice:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al eliminar la factura",
		);
	}
}

