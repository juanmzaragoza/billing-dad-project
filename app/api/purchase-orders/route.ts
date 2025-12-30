import { NextRequest, NextResponse } from "next/server";
import purchaseOrderService from "@/lib/services/purchase-order.service";
import { purchaseOrderSchema } from "@/lib/schemas/purchase-order.schemas";

/**
 * GET /api/purchase-orders
 * Get all purchase orders
 */
export async function GET() {
	try {
		const purchaseOrders =
			await purchaseOrderService.getAllPurchaseOrders();
		return NextResponse.json(purchaseOrders);
	} catch (error) {
		console.error("Error fetching purchase orders:", error);
		return NextResponse.json(
			{ error: "Error al obtener órdenes de compra" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/purchase-orders
 * Create a new purchase order
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate with schema
		const validatedData = purchaseOrderSchema.parse(body);

		const purchaseOrder =
			await purchaseOrderService.createPurchaseOrder(validatedData);

		return NextResponse.json(purchaseOrder, { status: 201 });
	} catch (error) {
		console.error("Error creating purchase order:", error);
		if (error instanceof Error && error.name === "ZodError") {
			return NextResponse.json(
				{ error: "Datos inválidos", details: error },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: "Error al crear la orden de compra" },
			{ status: 500 },
		);
	}
}


