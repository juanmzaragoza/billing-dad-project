import { NextRequest, NextResponse } from "next/server";
import invoiceService from "@/lib/services/invoice.service";
import type { InvoiceFormValues } from "@/app/(protected)/facturas/invoice-form";

export async function POST(request: NextRequest) {
	try {
		const body: InvoiceFormValues = await request.json();

		const invoice = await invoiceService.createInvoice(body);

		return NextResponse.json(
			{
				success: true,
				data: invoice,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating invoice:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Error al crear la factura",
			},
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const type = searchParams.get("type");
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");

		let invoices;

		if (type && ["A", "B", "C", "Unbilled"].includes(type)) {
			invoices = await invoiceService.getInvoicesByType(
				type as "A" | "B" | "C" | "Unbilled",
			);
		} else if (startDate && endDate) {
			invoices = await invoiceService.getInvoicesByDateRange(startDate, endDate);
		} else {
			invoices = await invoiceService.getAllInvoices();
		}

		return NextResponse.json(
			{
				success: true,
				data: invoices,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching invoices:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Error al obtener las facturas",
			},
			{ status: 500 },
		);
	}
}

