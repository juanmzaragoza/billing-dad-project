import type { ControllerRenderProps, FieldValues, Control } from "react-hook-form";
import type { TaxCondition } from "@/lib/schemas/fiscal.schemas";

/**
 * Props for TaxIdField component
 */
export interface TaxIdFieldProps {
	field: ControllerRenderProps<FieldValues, string>;
	className?: string;
	placeholder?: string;
	maxLength?: number;
	required?: boolean;
}

/**
 * Props for TaxConditionField component
 */
export interface TaxConditionFieldProps {
	field: ControllerRenderProps<FieldValues, string>;
	className?: string;
	placeholder?: string;
	required?: boolean;
	conditions?: TaxCondition[];
}

/**
 * Props for AddressField component
 */
export interface AddressFieldProps {
	field: ControllerRenderProps<FieldValues, string>;
	className?: string;
	placeholder?: string;
	required?: boolean;
	label?: string;
}

/**
 * Props for ItemFields component
 */
export interface ItemFieldsProps<TFieldValues extends FieldValues = FieldValues> {
	index: number;
	control: Control<TFieldValues>;
	onRemove?: () => void;
	canRemove?: boolean;
}

