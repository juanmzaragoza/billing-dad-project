"use client";

import { Separator } from "@/components/ui/separator";
import type { InvoiceTotalsProps } from "./totals.types";

/**
 * Reusable component to display invoice/purchase order totals
 * Shows subtotal, tax, and total in a consistent format
 */
export function InvoiceTotals({
	subtotal,
	tax,
	total,
	currency = "$",
	decimals = 2,
	className,
}: InvoiceTotalsProps) {
	const formatCurrency = (value: number) => {
		return `${currency}${value.toFixed(decimals)}`;
	};

	return (
		<div className={`space-y-2 ${className || ""}`}>
			<div className="flex justify-between text-sm">
				<span className="text-muted-foreground">Subtotal:</span>
				<span className="font-medium">{formatCurrency(subtotal)}</span>
			</div>
			<div className="flex justify-between text-sm">
				<span className="text-muted-foreground">IVA:</span>
				<span className="font-medium">{formatCurrency(tax)}</span>
			</div>
			<Separator />
			<div className="flex justify-between text-lg font-bold">
				<span>Total:</span>
				<span>{formatCurrency(total)}</span>
			</div>
		</div>
	);
}


