import { z } from "zod";
import { itemsArraySchema, taxConditionEnum, taxIdSchema } from "./index";

/**
 * Purchase order status enum
 */
export const purchaseOrderStatusEnum = z.enum([
	"Pendiente",
	"En Proceso",
	"Completada",
	"Cancelada",
]);

export type PurchaseOrderStatus = z.infer<typeof purchaseOrderStatusEnum>;

/**
 * Purchase order validation schema
 * Reuses shared schemas for items and fiscal information
 */
export const purchaseOrderSchema = z.object({
	orderNumber: z.string().min(1, "El número de orden es requerido"),
	date: z.string().min(1, "La fecha es requerida"),
	// Supplier data
	supplierId: z.string().optional(), // Reference to supplier
	supplierName: z.string().min(1, "La razón social es requerida"),
	supplierTaxId: taxIdSchema.optional(),
	supplierTaxCondition: taxConditionEnum.optional(),
	supplierAddress: z.string().optional(),
	// Items - reusing shared schema
	items: itemsArraySchema,
	// Payment condition
	paymentCondition: z.enum(["Contado", "Tarjeta", "Transferencia", "Cheque"], {
		required_error: "Selecciona una condición de pago",
	}),
	// Optional fields
	deliveryDate: z.string().optional(),
	notes: z.string().optional(),
	// Status - required with default value
	status: purchaseOrderStatusEnum,
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;


