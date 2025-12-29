import { z } from "zod";

/**
 * Tax rates for Argentina (Alícuotas de IVA)
 */
export const taxRateEnum = z.enum(["0", "10.5", "21"]);

export type TaxRate = z.infer<typeof taxRateEnum>;

/**
 * Schema for an invoice/purchase order item
 */
export const itemSchema = z.object({
	description: z.string().min(1, "La descripción es requerida"),
	quantity: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
	unitPrice: z.number().min(0, "El precio debe ser mayor o igual a 0"),
	taxRate: taxRateEnum,
});

export type Item = z.infer<typeof itemSchema>;

/**
 * Schema for an array of items (minimum 1 item required)
 */
export const itemsArraySchema = z
	.array(itemSchema)
	.min(1, "Debe haber al menos un item");

/**
 * Helper function to calculate item subtotal
 */
export function calculateItemSubtotal(item: Item): number {
	return item.quantity * item.unitPrice;
}

/**
 * Helper function to calculate item tax
 */
export function calculateItemTax(item: Item): number {
	const subtotal = calculateItemSubtotal(item);
	const taxRate = parseFloat(item.taxRate);
	return (subtotal * taxRate) / 100;
}

/**
 * Helper function to calculate item total
 */
export function calculateItemTotal(item: Item): number {
	return calculateItemSubtotal(item) + calculateItemTax(item);
}


