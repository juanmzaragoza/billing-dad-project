import { useMemo } from "react";
import type { Item } from "@/lib/schemas/item.schemas";
import {
	calculateItemSubtotal,
	calculateItemTax,
} from "@/lib/schemas/item.schemas";

/**
 * Hook to calculate totals from an array of items
 * Reusable for invoices, purchase orders, etc.
 */
export function useItemsCalculations(items: Item[]) {
	const subtotal = useMemo(() => {
		return items.reduce((sum, item) => {
			return sum + calculateItemSubtotal(item);
		}, 0);
	}, [items]);

	const tax = useMemo(() => {
		return items.reduce((sum, item) => {
			return sum + calculateItemTax(item);
		}, 0);
	}, [items]);

	const total = useMemo(() => {
		return subtotal + tax;
	}, [subtotal, tax]);

	return {
		subtotal,
		tax,
		total,
	};
}


