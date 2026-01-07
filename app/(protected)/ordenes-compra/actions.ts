"use server";

import { revalidatePath } from "next/cache";
import purchaseOrderService from "@/lib/services/purchase-order.service";
import type { PurchaseOrderDocument } from "@/lib/types/purchase-order.types";
import type { PurchaseOrderFormValues } from "@/lib/schemas/purchase-order.schemas";

/**
 * Get all purchase orders
 */
export async function getAllPurchaseOrders(): Promise<PurchaseOrderDocument[]> {
	try {
		return await purchaseOrderService.getAllPurchaseOrders();
	} catch (error) {
		console.error("Error fetching purchase orders:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Error al obtener las órdenes de compra",
		);
	}
}

/**
 * Get a purchase order by ID
 */
export async function getPurchaseOrderById(
	id: string,
): Promise<PurchaseOrderDocument | null> {
	try {
		return await purchaseOrderService.getPurchaseOrderById(id);
	} catch (error) {
		console.error("Error fetching purchase order:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Error al obtener la orden de compra",
		);
	}
}

/**
 * Create a new purchase order
 */
export async function createPurchaseOrder(
	data: PurchaseOrderFormValues,
): Promise<PurchaseOrderDocument> {
	try {
		const purchaseOrder = await purchaseOrderService.createPurchaseOrder(data);
		revalidatePath("/ordenes-compra");
		return purchaseOrder;
	} catch (error) {
		console.error("Error creating purchase order:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Error al crear la orden de compra",
		);
	}
}

/**
 * Update a purchase order
 */
export async function updatePurchaseOrder(
	id: string,
	data: Partial<PurchaseOrderDocument>,
): Promise<PurchaseOrderDocument | null> {
	try {
		const purchaseOrder = await purchaseOrderService.updatePurchaseOrder(
			id,
			data,
		);
		if (!purchaseOrder) {
			throw new Error("Orden de compra no encontrada");
		}
		revalidatePath("/ordenes-compra");
		return purchaseOrder;
	} catch (error) {
		console.error("Error updating purchase order:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Error al actualizar la orden de compra",
		);
	}
}

/**
 * Update purchase order from form values
 */
export async function updatePurchaseOrderFromForm(
	id: string,
	data: Partial<PurchaseOrderFormValues>,
): Promise<PurchaseOrderDocument> {
	try {
		// Convert form values to document structure
		const updateData: Partial<PurchaseOrderDocument> = {
			orderNumber: data.orderNumber,
			date: data.date,
			supplierId: data.supplierId,
			supplierName: data.supplierName,
			supplierTaxId: data.supplierTaxId,
			supplierTaxCondition: data.supplierTaxCondition,
			supplierAddress: data.supplierAddress,
			items: data.items as PurchaseOrderDocument["items"],
			paymentCondition: data.paymentCondition,
			deliveryDate: data.deliveryDate,
			notes: data.notes,
			status: data.status,
		};

		const purchaseOrder = await updatePurchaseOrder(id, updateData);
		if (!purchaseOrder) {
			throw new Error("Orden de compra no encontrada");
		}
		return purchaseOrder;
	} catch (error) {
		console.error("Error updating purchase order from form:", error);
		throw error;
	}
}

/**
 * Delete a purchase order
 */
export async function deletePurchaseOrder(id: string): Promise<void> {
	try {
		const deleted = await purchaseOrderService.deletePurchaseOrder(id);
		if (!deleted) {
			throw new Error("Orden de compra no encontrada");
		}
		revalidatePath("/ordenes-compra");
	} catch (error) {
		console.error("Error deleting purchase order:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Error al eliminar la orden de compra",
		);
	}
}

/**
 * Update purchase order status
 */
export async function updatePurchaseOrderStatus(
	id: string,
	status: PurchaseOrderDocument["status"],
): Promise<PurchaseOrderDocument | null> {
	try {
		const purchaseOrder = await purchaseOrderService.updatePurchaseOrderStatus(
			id,
			status,
		);
		if (!purchaseOrder) {
			throw new Error("Orden de compra no encontrada");
		}
		revalidatePath("/ordenes-compra");
		return purchaseOrder;
	} catch (error) {
		console.error("Error updating purchase order status:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Error al actualizar el estado de la orden de compra",
		);
	}
}

