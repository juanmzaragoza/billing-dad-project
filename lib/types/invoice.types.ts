import { ObjectId } from "mongodb";
import type { ClientSnapshot } from "./client.types";

/**
 * Invoice item structure
 */
export interface InvoiceItem {
	description: string;
	quantity: number;
	unitPrice: number;
	taxRate: "0" | "10.5" | "21";
}

/**
 * Invoice document structure stored in database
 * Uses hybrid approach: clientId (optional reference) + client snapshot (preserves historical data)
 */
export interface InvoiceDocument {
	_id?: ObjectId | string;
	invoiceType: "A" | "B" | "C" | "Unbilled";
	pointOfSale?: string;
	invoiceNumber?: string;
	date: string;
	// Client reference (optional, for linking to clients collection)
	clientId?: string;
	// Client snapshot (preserves data at time of invoice creation)
	client: ClientSnapshot;
	// Legacy fields (kept for backward compatibility, will be populated from client snapshot)
	clientName: string;
	clientTaxId?: string;
	clientTaxCondition?: "Responsable Inscripto" | "Consumidor Final" | "Exento" | "Monotributo";
	clientAddress?: string;
	items: InvoiceItem[];
	paymentCondition: "Contado" | "Tarjeta" | "Transferencia" | "Cheque";
	subtotal: number;
	tax: number;
	total: number;
	createdAt: Date;
	updatedAt: Date;
}





