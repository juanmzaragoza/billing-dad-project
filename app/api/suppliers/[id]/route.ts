import { NextRequest, NextResponse } from "next/server";
import supplierService from "@/lib/services/supplier.service";

/**
 * GET /api/suppliers/[id]
 * Get a supplier by ID
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supplier = await supplierService.getSupplierById(id);

		if (!supplier) {
			return NextResponse.json(
				{ error: "Proveedor no encontrado" },
				{ status: 404 },
			);
		}

		return NextResponse.json(supplier);
	} catch (error) {
		console.error("Error fetching supplier:", error);
		return NextResponse.json(
			{ error: "Error al obtener el proveedor" },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/suppliers/[id]
 * Update a supplier
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();

		const supplier = await supplierService.updateSupplier(id, {
			name: body.name?.trim(),
			taxId: body.taxId?.trim(),
			taxCondition: body.taxCondition,
			address: body.address?.trim(),
			email: body.email?.trim(),
			phone: body.phone?.trim(),
			contactPerson: body.contactPerson?.trim(),
			notes: body.notes?.trim(),
		});

		if (!supplier) {
			return NextResponse.json(
				{ error: "Proveedor no encontrado" },
				{ status: 404 },
			);
		}

		return NextResponse.json(supplier);
	} catch (error) {
		console.error("Error updating supplier:", error);
		return NextResponse.json(
			{ error: "Error al actualizar el proveedor" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/suppliers/[id]
 * Delete a supplier
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const deleted = await supplierService.deleteSupplier(id);

		if (!deleted) {
			return NextResponse.json(
				{ error: "Proveedor no encontrado" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting supplier:", error);
		return NextResponse.json(
			{ error: "Error al eliminar el proveedor" },
			{ status: 500 },
		);
	}
}

