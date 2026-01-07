"use server";

import { revalidatePath } from "next/cache";
import supplierService from "@/lib/services/supplier.service";
import type { SupplierDocument } from "@/lib/types/supplier.types";

/**
 * Server Actions for suppliers
 * These run on the server and can be called directly from client components
 */

export async function createSupplier(
	data: Omit<SupplierDocument, "_id" | "createdAt" | "updatedAt">,
): Promise<SupplierDocument> {
	try {
		const supplier = await supplierService.createSupplier(data);
		revalidatePath("/proveedores");
		return supplier;
	} catch (error) {
		console.error("Error creating supplier:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al crear el proveedor",
		);
	}
}

export async function getAllSuppliers(): Promise<SupplierDocument[]> {
	try {
		return await supplierService.getAllSuppliers();
	} catch (error) {
		console.error("Error fetching suppliers:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al obtener los proveedores",
		);
	}
}

export async function getSupplierById(
	id: string,
): Promise<SupplierDocument | null> {
	try {
		return await supplierService.getSupplierById(id);
	} catch (error) {
		console.error("Error fetching supplier:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al obtener el proveedor",
		);
	}
}

export async function updateSupplier(
	id: string,
	data: Partial<Omit<SupplierDocument, "_id" | "createdAt">>,
): Promise<SupplierDocument> {
	try {
		const supplier = await supplierService.updateSupplier(id, data);
		if (!supplier) {
			throw new Error("Proveedor no encontrado");
		}
		revalidatePath("/proveedores");
		return supplier;
	} catch (error) {
		console.error("Error updating supplier:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al actualizar el proveedor",
		);
	}
}

export async function deleteSupplier(id: string): Promise<void> {
	try {
		const deleted = await supplierService.deleteSupplier(id);
		if (!deleted) {
			throw new Error("Proveedor no encontrado");
		}
		revalidatePath("/proveedores");
	} catch (error) {
		console.error("Error deleting supplier:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al eliminar el proveedor",
		);
	}
}


