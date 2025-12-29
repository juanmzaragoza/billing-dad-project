/**
 * Shared validation schemas
 * Export all schemas from a single entry point
 */

// Fiscal schemas
export {
	taxConditionEnum,
	taxIdSchema,
	taxIdRequiredSchema,
	taxConditionSchema,
	taxConditionRequiredSchema,
	fiscalInfoSchema,
	fiscalInfoRequiredSchema,
} from "./fiscal.schemas";
export type { TaxCondition } from "./fiscal.schemas";

// Item schemas
export {
	taxRateEnum,
	itemSchema,
	itemsArraySchema,
	calculateItemSubtotal,
	calculateItemTax,
	calculateItemTotal,
} from "./item.schemas";
export type { TaxRate, Item } from "./item.schemas";


