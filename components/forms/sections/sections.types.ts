import type { ReactNode } from "react";
import type { UseFieldArrayReturn, Control, FieldValues } from "react-hook-form";
import type { Item } from "@/lib/schemas/item.schemas";

/**
 * Props for FormSection component
 */
export interface FormSectionProps {
	title: string;
	description?: string;
	children: ReactNode;
	showSeparator?: boolean;
	className?: string;
}

/**
 * Props for FiscalInfoSection component
 */
export interface FiscalInfoSectionProps {
	/**
	 * Prefix for field names (e.g., "client", "supplier")
	 * Results in fields like: clientTaxId, clientTaxCondition, clientAddress
	 */
	fieldPrefix: string;
	/**
	 * Whether fiscal information is required (for AFIP invoices)
	 */
	required?: boolean;
	/**
	 * Whether to show fiscal fields (Tax ID and Tax Condition)
	 * If false, only address will be shown
	 */
	showFiscalFields?: boolean;
	/**
	 * Whether to show address field
	 */
	showAddress?: boolean;
	/**
	 * Section title
	 */
	title?: string;
	/**
	 * Grid columns class (default: "grid-cols-1 sm:grid-cols-2")
	 */
	gridCols?: string;
	/**
	 * Whether to show separator after section
	 */
	showSeparator?: boolean;
}

/**
 * Props for ItemsSection component
 */
export interface ItemsSectionProps<TFieldValues extends FieldValues = FieldValues> {
	/**
	 * Field array from react-hook-form useFieldArray
	 */
	fields: UseFieldArrayReturn<TFieldValues>["fields"];
	/**
	 * Append function from useFieldArray
	 */
	onAdd: () => void;
	/**
	 * Remove function from useFieldArray
	 */
	onRemove: (index: number) => void;
	/**
	 * Form control for fields
	 */
	control: Control<TFieldValues>;
	/**
	 * Section title
	 */
	title?: string;
	/**
	 * Whether to show separator after section
	 */
	showSeparator?: boolean;
}

