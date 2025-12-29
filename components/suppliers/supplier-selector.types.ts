import type { SupplierDocument } from "@/lib/types/supplier.types";

/**
 * Supplier Selector component props
 */
export interface SupplierSelectorProps {
	value?: string; // supplierId
	onSelect: (supplier: SupplierDocument | null) => void;
	onInputChange?: (value: string) => void; // Called when user types manually
	onCreateNew?: () => void;
	className?: string;
	placeholder?: string;
	// Function to check if there's enough data to create a supplier
	hasEnoughDataToCreate?: () => boolean;
}

