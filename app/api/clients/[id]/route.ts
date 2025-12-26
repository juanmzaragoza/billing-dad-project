import { NextRequest, NextResponse } from "next/server";
import clientService from "@/lib/services/client.service";

/**
 * GET /api/clients/[id]
 * Get a client by ID
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const client = await clientService.getClientById(id);

		if (!client) {
			return NextResponse.json(
				{ error: "Cliente no encontrado" },
				{ status: 404 },
			);
		}

		return NextResponse.json(client, { status: 200 });
	} catch (error) {
		console.error("Error fetching client:", error);
		return NextResponse.json(
			{ error: "Error al obtener el cliente" },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/clients/[id]
 * Update a client
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();

		const client = await clientService.updateClient(id, {
			name: body.name?.trim(),
			taxId: body.taxId?.trim(),
			taxCondition: body.taxCondition,
			address: body.address?.trim(),
			email: body.email?.trim(),
			phone: body.phone?.trim(),
			notes: body.notes?.trim(),
		});

		if (!client) {
			return NextResponse.json(
				{ error: "Cliente no encontrado" },
				{ status: 404 },
			);
		}

		return NextResponse.json(client, { status: 200 });
	} catch (error) {
		console.error("Error updating client:", error);
		return NextResponse.json(
			{ error: "Error al actualizar el cliente" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/clients/[id]
 * Delete a client
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const deleted = await clientService.deleteClient(id);

		if (!deleted) {
			return NextResponse.json(
				{ error: "Cliente no encontrado" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error("Error deleting client:", error);
		return NextResponse.json(
			{ error: "Error al eliminar el cliente" },
			{ status: 500 },
		);
	}
}

