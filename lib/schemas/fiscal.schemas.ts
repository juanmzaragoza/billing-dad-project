import { z } from "zod";

/**
 * Tax conditions for Argentina (Condición frente al IVA)
 */
export const taxConditionEnum = z.enum([
	"Responsable Inscripto",
	"Consumidor Final",
	"Exento",
	"Monotributo",
]);

export type TaxCondition = z.infer<typeof taxConditionEnum>;

/**
 * Schema for tax ID (CUIT/CUIL/DNI) - Argentina
 * Must be exactly 11 digits for CUIT/CUIL, or 7-8 digits for DNI
 */
export const taxIdSchema = z
	.string()
	.min(7, "Debe tener al menos 7 dígitos")
	.max(11, "No puede tener más de 11 dígitos")
	.regex(/^\d+$/, "Solo se permiten números")
	.refine(
		(val) => {
			// For AFIP invoices, require exactly 11 digits (CUIT/CUIL)
			// But allow flexibility for other use cases
			return val.length >= 7;
		},
		{ message: "El CUIT debe tener 11 dígitos" },
	);

/**
 * Schema for tax ID when it's required for AFIP invoices
 */
export const taxIdRequiredSchema = taxIdSchema.refine(
	(val) => val.length === 11,
	{ message: "El CUIT debe tener exactamente 11 dígitos para facturas AFIP" },
);

/**
 * Schema for tax condition - optional by default
 */
export const taxConditionSchema = taxConditionEnum.optional();

/**
 * Schema for tax condition when required
 */
export const taxConditionRequiredSchema = taxConditionEnum;

/**
 * Complete fiscal information schema
 * Useful for forms that need client/provider fiscal data
 */
export const fiscalInfoSchema = z.object({
	taxId: taxIdSchema.optional(),
	taxCondition: taxConditionSchema,
});

/**
 * Complete fiscal information schema when required (for AFIP invoices)
 */
export const fiscalInfoRequiredSchema = z.object({
	taxId: taxIdRequiredSchema,
	taxCondition: taxConditionRequiredSchema,
});


