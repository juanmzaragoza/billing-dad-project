import { NextRequest, NextResponse } from "next/server";
import clientService from "@/lib/services/client.service";

/**
 * GET /api/clients
 * Get all clients or search clients
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const query = searchParams.get("q");

		let clients;
		if (query) {
			clients = await clientService.searchClients(query);
		} else {
			clients = await clientService.getAllClients();
		}

		return NextResponse.json(clients, { status: 200 });
	} catch (error) {
		console.error("Error fetching clients:", error);
		return NextResponse.json(
			{ error: "Error al obtener los clientes" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.name || body.name.trim().length === 0) {
			return NextResponse.json(
				{ error: "El nombre del cliente es requerido" },
				{ status: 400 },
			);
		}

		const client = await clientService.createClient({
			name: body.name.trim(),
			taxId: body.taxId?.trim(),
			taxCondition: body.taxCondition,
			address: body.address?.trim(),
			email: body.email?.trim(),
			phone: body.phone?.trim(),
			notes: body.notes?.trim(),
		});

		return NextResponse.json(client, { status: 201 });
	} catch (error) {
		console.error("Error creating client:", error);
		return NextResponse.json(
			{ error: "Error al crear el cliente" },
			{ status: 500 },
		);
	}
}

