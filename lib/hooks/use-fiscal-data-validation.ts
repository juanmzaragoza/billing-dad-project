import { useMemo } from "react";
import type { UseFormReturn, FieldValues } from "react-hook-form";

export interface UseFiscalDataValidationOptions<TFormValues extends FieldValues> {
	/**
	 * Form instance from react-hook-form
	 */
	form: UseFormReturn<TFormValues>;
	/**
	 * Name field path
	 */
	nameField: keyof TFormValues;
	/**
	 * Tax ID field path
	 */
	taxIdField?: keyof TFormValues;
	/**
	 * Tax condition field path
	 */
	taxConditionField?: keyof TFormValues;
	/**
	 * Whether fiscal data is required (e.g., for AFIP invoices)
	 * If false, only name is required
	 */
	requireFiscalData?: boolean;
}

/**
 * Hook to validate if there's enough data to create an entity
 * Returns a function that checks if required fields are filled
 */
export function useFiscalDataValidation<TFormValues extends FieldValues>({
	form,
	nameField,
	taxIdField,
	taxConditionField,
	requireFiscalData = true,
}: UseFiscalDataValidationOptions<TFormValues>) {
	const hasEnoughDataToCreate = useMemo(() => {
		return (): boolean => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const name = form.watch(nameField as any);
			
			// For non-fiscal entities, only name is required
			if (!requireFiscalData) {
				return !!(name && String(name).trim().length > 0);
			}

			// For fiscal entities, need at least name + (taxId OR taxCondition)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const taxId = taxIdField ? form.watch(taxIdField as any) : undefined;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const taxCondition = taxConditionField ? form.watch(taxConditionField as any) : undefined;
			
			return !!(
				name &&
				String(name).trim().length > 0 &&
				(String(taxId || "").trim() || taxCondition)
			);
		};
	}, [form, nameField, taxIdField, taxConditionField, requireFiscalData]);

	return {
		hasEnoughDataToCreate,
	};
}

