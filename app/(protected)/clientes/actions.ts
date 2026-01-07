"use server";

import { revalidatePath } from "next/cache";
import clientService from "@/lib/services/client.service";
import type { ClientDocument } from "@/lib/types/client.types";

/**
 * Server Actions for clients
 * These run on the server and can be called directly from client components
 */

export async function createClient(
	data: Omit<ClientDocument, "_id" | "createdAt" | "updatedAt">,
): Promise<ClientDocument> {
	try {
		const client = await clientService.createClient(data);
		revalidatePath("/clientes");
		return client;
	} catch (error) {
		console.error("Error creating client:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al crear el cliente",
		);
	}
}

export async function getAllClients(): Promise<ClientDocument[]> {
	try {
		return await clientService.getAllClients();
	} catch (error) {
		console.error("Error fetching clients:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al obtener los clientes",
		);
	}
}

export async function getClientById(id: string): Promise<ClientDocument | null> {
	try {
		return await clientService.getClientById(id);
	} catch (error) {
		console.error("Error fetching client:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al obtener el cliente",
		);
	}
}

export async function updateClient(
	id: string,
	data: Partial<Omit<ClientDocument, "_id" | "createdAt">>,
): Promise<ClientDocument> {
	try {
		const client = await clientService.updateClient(id, data);
		if (!client) {
			throw new Error("Cliente no encontrado");
		}
		revalidatePath("/clientes");
		return client;
	} catch (error) {
		console.error("Error updating client:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al actualizar el cliente",
		);
	}
}

export async function deleteClient(id: string): Promise<void> {
	try {
		const deleted = await clientService.deleteClient(id);
		if (!deleted) {
			throw new Error("Cliente no encontrado");
		}
		revalidatePath("/clientes");
	} catch (error) {
		console.error("Error deleting client:", error);
		throw new Error(
			error instanceof Error ? error.message : "Error al eliminar el cliente",
		);
	}
}


