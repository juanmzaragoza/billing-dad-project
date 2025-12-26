import type { InvoiceDocument } from "@/lib/types/invoice.types";

/**
 * Invoice helper functions
 */

/**
 * Get the label for an invoice type
 * @param type - Invoice type (A, B, C, or Unbilled)
 * @returns Human-readable label for the invoice type
 */
export function getInvoiceTypeLabel(type: string): string {
	const labels: Record<string, string> = {
		A: "Factura A",
		B: "Factura B",
		C: "Factura C",
		Unbilled: "Sin facturar",
	};
	return labels[type] || type;
}

/**
 * Get the formatted invoice number
 * @param invoice - Invoice document
 * @returns Formatted invoice number (e.g., "0001-00000001") or "-" for unbilled invoices
 */
export function getInvoiceNumber(invoice: InvoiceDocument): string {
	if (invoice.invoiceType === "Unbilled") {
		return "-";
	}
	return `${invoice.pointOfSale || ""}-${invoice.invoiceNumber || ""}`;
}

/**
 * Get a descriptive label for an invoice (for display purposes)
 * @param invoice - Invoice document
 * @returns Descriptive label (e.g., "Factura A 0001-00000001")
 */
export function getInvoiceLabel(invoice: InvoiceDocument): string {
	if (invoice.invoiceType === "Unbilled") {
		return "Venta sin facturar";
	}
	return `${getInvoiceTypeLabel(invoice.invoiceType)} ${getInvoiceNumber(invoice)}`;
}

/**
 * Format currency amount
 * @param amount - Amount to format
 * @param currency - Currency symbol (default: "$")
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(
	amount: number,
	currency: string = "$",
): string {
	return `${currency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

