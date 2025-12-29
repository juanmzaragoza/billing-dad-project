/**
 * Props for InvoiceTotals component
 */
export interface InvoiceTotalsProps {
	subtotal: number;
	tax: number;
	total: number;
	/**
	 * Currency symbol (default: "$")
	 */
	currency?: string;
	/**
	 * Number of decimal places (default: 2)
	 */
	decimals?: number;
	/**
	 * Custom className for the container
	 */
	className?: string;
}

