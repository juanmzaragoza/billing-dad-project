import { ObjectId } from "mongodb";
import type { TaxCondition } from "@/lib/schemas/fiscal.schemas";

/**
 * Supplier document structure stored in database
 */
export interface SupplierDocument {
	_id?: ObjectId | string;
	name: string;
	taxId?: string;
	taxCondition?: TaxCondition;
	address?: string;
	email?: string;
	phone?: string;
	contactPerson?: string; // Persona de contacto
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Supplier data snapshot stored in purchase orders (preserves historical data)
 */
export interface SupplierSnapshot {
	supplierId?: string; // Reference to SupplierDocument._id (optional for historical orders)
	name: string;
	taxId?: string;
	taxCondition?: TaxCondition;
	address?: string;
}


