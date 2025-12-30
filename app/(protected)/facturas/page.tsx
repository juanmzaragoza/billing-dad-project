"use client";

import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CrudListPage, CrudListPageActions } from "@/components/shared/crud-list-page";
import type { CrudListColumn } from "@/components/shared/crud-list-page";
import { InvoiceView } from "@/components/invoices/invoice-view";
import { InvoiceForm } from "./invoice-form";
import type { InvoiceDocument } from "@/lib/types/invoice.types";
import type { InvoiceFormValues } from "./invoice-form";
import * as invoiceActions from "./actions";
import { formatDate } from "@/lib/helpers/date.helper";
import {
	getInvoiceTypeLabel,
	getInvoiceNumber,
} from "@/lib/helpers/invoice.helper";

export default function FacturasPage() {
	// Define columns for the table
	const columns: CrudListColumn<InvoiceDocument>[] = [
		{
			key: "date",
			header: "Fecha",
			render: (invoice) => formatDate(invoice.date),
		},
		{
			key: "invoiceType",
			header: "Tipo",
			render: (invoice) => (
				<Badge variant="outline">
					{getInvoiceTypeLabel(invoice.invoiceType)}
				</Badge>
			),
		},
		{
			key: "invoiceNumber",
			header: "Número",
			render: (invoice) => (
				<span className="font-mono">{getInvoiceNumber(invoice)}</span>
			),
		},
		{
			key: "clientName",
			header: "Cliente",
			render: (invoice) => invoice.clientName,
		},
		{
			key: "subtotal",
			header: "Subtotal",
			render: (invoice) => `$${invoice.subtotal.toFixed(2)}`,
		},
		{
			key: "tax",
			header: "IVA",
			render: (invoice) => `$${invoice.tax.toFixed(2)}`,
		},
		{
			key: "total",
			header: "Total",
			render: (invoice) => (
				<span className="font-semibold">${invoice.total.toFixed(2)}</span>
			),
		},
		{
			key: "paymentCondition",
			header: "Condición",
			render: (invoice) => invoice.paymentCondition,
		},
	];

	return (
		<CrudListPage<InvoiceDocument, InvoiceFormValues>
			title="Facturas"
			description="Gestiona tus facturas y documentos fiscales"
			icon={Receipt}
			newButtonLabel="Nueva Factura"
			createDialogTitle="Nueva Factura"
			createDialogDescription="Completa los datos para crear una nueva factura según normativa AFIP"
			fetchItems={invoiceActions.getAllInvoices}
			onCreate={invoiceActions.createInvoice}
			onDelete={async (invoice) => {
				const id = invoice._id?.toString();
				if (!id) throw new Error("ID de factura inválido");
				await invoiceActions.deleteInvoice(id);
			}}
			getItemId={(invoice) => invoice._id?.toString()}
			getDisplayName={(invoice) =>
				`Para el cliente ${invoice.clientName} por un total de $${invoice.total.toFixed(2)}`
			}
			columns={columns}
			formComponent={({ onSubmit, onCancel }) => (
				<InvoiceForm onSubmit={onSubmit} onCancel={onCancel} />
			)}
			viewComponent={({ item }) => <InvoiceView invoice={item} />}
			getViewTitle={(invoice) => `Factura ${getInvoiceNumber(invoice)}`}
			getViewDescription={(invoice) =>
				`Detalles de la factura para ${invoice.clientName}`
			}
			renderActions={(invoice, onDelete, onView) => (
				<CrudListPageActions onView={onView} onDelete={onDelete} />
			)}
		/>
	);
}

