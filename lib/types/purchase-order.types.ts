import { ObjectId } from "mongodb";
import type { SupplierSnapshot } from "./supplier.types";
import type { Item } from "@/lib/schemas/item.schemas";

/**
 * Purchase order status
 */
export type PurchaseOrderStatus =
	| "Pendiente"
	| "En Proceso"
	| "Completada"
	| "Cancelada";

/**
 * Purchase order document structure stored in database
 * Uses hybrid approach: supplierId (optional reference) + supplier snapshot (preserves historical data)
 */
export interface PurchaseOrderDocument {
	_id?: ObjectId | string;
	orderNumber: string; // Número de orden (generado automáticamente o manual)
	date: string;
	// Supplier reference (optional, for linking to suppliers collection)
	supplierId?: string;
	// Supplier snapshot (preserves data at time of order creation)
	supplier: SupplierSnapshot;
	// Legacy fields (kept for backward compatibility, will be populated from supplier snapshot)
	supplierName: string;
	supplierTaxId?: string;
	supplierTaxCondition?: SupplierSnapshot["taxCondition"];
	supplierAddress?: string;
	items: Item[];
	paymentCondition: "Contado" | "Tarjeta" | "Transferencia" | "Cheque";
	deliveryDate?: string; // Fecha de entrega esperada
	notes?: string; // Notas adicionales
	subtotal: number;
	tax: number;
	total: number;
	status: PurchaseOrderStatus;
	createdAt: Date;
	updatedAt: Date;
}


