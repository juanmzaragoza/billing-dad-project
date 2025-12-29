import { NextRequest, NextResponse } from "next/server";
import supplierService from "@/lib/services/supplier.service";

/**
 * GET /api/suppliers
 * Get all suppliers or search suppliers by query
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const query = searchParams.get("q");

		if (query) {
			// Search suppliers
			const suppliers = await supplierService.searchSuppliers(query);
			return NextResponse.json(suppliers);
		}

		// Get all suppliers
		const suppliers = await supplierService.getAllSuppliers();
		return NextResponse.json(suppliers);
	} catch (error) {
		console.error("Error fetching suppliers:", error);
		return NextResponse.json(
			{ error: "Error al obtener proveedores" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/suppliers
 * Create a new supplier
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.name || body.name.trim().length === 0) {
			return NextResponse.json(
				{ error: "El nombre es requerido" },
				{ status: 400 },
			);
		}

		const supplier = await supplierService.createSupplier({
			name: body.name.trim(),
			taxId: body.taxId?.trim() || undefined,
			taxCondition: body.taxCondition || undefined,
			address: body.address?.trim() || undefined,
			email: body.email?.trim() || undefined,
			phone: body.phone?.trim() || undefined,
			contactPerson: body.contactPerson?.trim() || undefined,
			notes: body.notes?.trim() || undefined,
		});

		return NextResponse.json(supplier, { status: 201 });
	} catch (error) {
		console.error("Error creating supplier:", error);
		return NextResponse.json(
			{ error: "Error al crear el proveedor" },
			{ status: 500 },
		);
	}
}


