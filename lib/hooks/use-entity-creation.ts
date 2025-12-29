import { useCallback } from "react";
import type { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";

export interface UseEntityCreationOptions<TFormValues extends FieldValues> {
	/**
	 * Form instance from react-hook-form
	 */
	form: UseFormReturn<TFormValues>;
	/**
	 * Name field path in the form
	 */
	nameField: FieldPath<TFormValues>;
	/**
	 * ID field path in the form (optional, for linking to existing entity)
	 */
	idField?: FieldPath<TFormValues>;
	/**
	 * Tax ID field path (optional)
	 */
	taxIdField?: FieldPath<TFormValues>;
	/**
	 * Tax condition field path (optional)
	 */
	taxConditionField?: FieldPath<TFormValues>;
	/**
	 * Address field path (optional)
	 */
	addressField?: FieldPath<TFormValues>;
	/**
	 * API endpoint for creating the entity
	 */
	createEndpoint: string;
	/**
	 * Function to get entity data from form values
	 */
	getEntityData: (formValues: TFormValues) => {
		name: string;
		taxId?: string;
		taxCondition?: string;
		address?: string;
	};
	/**
	 * Function to update form fields after entity creation
	 */
	updateFormFields: (
		form: UseFormReturn<TFormValues>,
		entity: { _id: string; name: string; taxId?: string; taxCondition?: string; address?: string },
		formValues: TFormValues
	) => void;
	/**
	 * Fields to trigger validation on after creation
	 */
	validationFields?: FieldPath<TFormValues>[];
	/**
	 * Error message for missing name
	 */
	nameRequiredMessage?: string;
	/**
	 * Error message for creation failure
	 */
	creationErrorMessage?: string;
}

/**
 * Hook for creating entities from form data
 * Handles validation, API calls, and form field updates
 */
export function useEntityCreation<TFormValues extends FieldValues>({
	form,
	nameField,
	// These fields are part of the interface for documentation but not used directly in the hook
	// They are used via getEntityData and updateFormFields callbacks
	idField: _idField,
	taxIdField: _taxIdField,
	taxConditionField: _taxConditionField,
	addressField: _addressField,
	createEndpoint,
	getEntityData,
	updateFormFields,
	validationFields,
	nameRequiredMessage = "El nombre es requerido",
	creationErrorMessage = "Error al crear la entidad. Se creará automáticamente al guardar.",
}: UseEntityCreationOptions<TFormValues>) {
	// Suppress unused variable warnings - these are used via callbacks
	void _idField;
	void _taxIdField;
	void _taxConditionField;
	void _addressField;
	const createEntity = useCallback(async () => {
		// Get all current form values
		const formValues = form.getValues();
		const entityData = getEntityData(formValues);
		const name = entityData.name;

		if (!name || name.trim().length === 0) {
			form.setError(nameField, {
				type: "manual",
				message: nameRequiredMessage,
			});
			return;
		}

		try {
			const response = await fetch(createEndpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					taxId: entityData.taxId?.trim() || undefined,
					taxCondition: entityData.taxCondition || undefined,
					address: entityData.address?.trim() || undefined,
				}),
			});

			if (!response.ok) {
				throw new Error("Error al crear la entidad");
			}

			const newEntity = await response.json();
			
			// Update form fields with the created entity
			updateFormFields(form, newEntity, formValues);

			// Trigger validation to update form state
			if (validationFields) {
				form.trigger(validationFields);
			}
		} catch (error) {
			console.error("Error creating entity:", error);
			form.setError(nameField, {
				type: "manual",
				message: creationErrorMessage,
			});
		}
	}, [
		form,
		nameField,
		createEndpoint,
		getEntityData,
		updateFormFields,
		validationFields,
		nameRequiredMessage,
		creationErrorMessage,
	]);

	return {
		createEntity,
	};
}

