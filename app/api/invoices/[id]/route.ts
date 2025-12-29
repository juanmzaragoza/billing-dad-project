import { NextRequest, NextResponse } from "next/server";
import invoiceService from "@/lib/services/invoice.service";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const invoice = await invoiceService.getInvoiceById(id);

		if (!invoice) {
			return NextResponse.json(
				{
					success: false,
					error: "Factura no encontrada",
				},
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{
				success: true,
				data: invoice,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching invoice:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Error al obtener la factura",
			},
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();

		const invoice = await invoiceService.updateInvoice(id, body);

		if (!invoice) {
			return NextResponse.json(
				{
					success: false,
					error: "Factura no encontrada",
				},
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{
				success: true,
				data: invoice,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating invoice:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Error al actualizar la factura",
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const deleted = await invoiceService.deleteInvoice(id);

		if (!deleted) {
			return NextResponse.json(
				{
					success: false,
					error: "Factura no encontrada",
				},
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Factura eliminada exitosamente",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting invoice:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Error al eliminar la factura",
			},
			{ status: 500 },
		);
	}
}






