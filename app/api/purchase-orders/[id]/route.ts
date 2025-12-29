import { NextRequest, NextResponse } from "next/server";
import purchaseOrderService from "@/lib/services/purchase-order.service";

/**
 * GET /api/purchase-orders/[id]
 * Get a purchase order by ID
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const purchaseOrder =
			await purchaseOrderService.getPurchaseOrderById(id);

		if (!purchaseOrder) {
			return NextResponse.json(
				{ error: "Orden de compra no encontrada" },
				{ status: 404 },
			);
		}

		return NextResponse.json(purchaseOrder);
	} catch (error) {
		console.error("Error fetching purchase order:", error);
		return NextResponse.json(
			{ error: "Error al obtener la orden de compra" },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/purchase-orders/[id]
 * Update a purchase order
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();

		const purchaseOrder = await purchaseOrderService.updatePurchaseOrder(
			id,
			body,
		);

		if (!purchaseOrder) {
			return NextResponse.json(
				{ error: "Orden de compra no encontrada" },
				{ status: 404 },
			);
		}

		return NextResponse.json(purchaseOrder);
	} catch (error) {
		console.error("Error updating purchase order:", error);
		return NextResponse.json(
			{ error: "Error al actualizar la orden de compra" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/purchase-orders/[id]
 * Delete a purchase order
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const deleted = await purchaseOrderService.deletePurchaseOrder(id);

		if (!deleted) {
			return NextResponse.json(
				{ error: "Orden de compra no encontrada" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting purchase order:", error);
		return NextResponse.json(
			{ error: "Error al eliminar la orden de compra" },
			{ status: 500 },
		);
	}
}

