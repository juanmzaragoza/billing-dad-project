import { ObjectId } from "mongodb";

/**
 * Client document structure stored in database
 */
export interface ClientDocument {
	_id?: ObjectId | string;
	name: string;
	taxId?: string;
	taxCondition?: "Responsable Inscripto" | "Consumidor Final" | "Exento" | "Monotributo";
	address?: string;
	email?: string;
	phone?: string;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Client data snapshot stored in invoices (preserves historical data)
 */
export interface ClientSnapshot {
	clientId?: string; // Reference to ClientDocument._id (optional for historical invoices)
	name: string;
	taxId?: string;
	taxCondition?: "Responsable Inscripto" | "Consumidor Final" | "Exento" | "Monotributo";
	address?: string;
}





