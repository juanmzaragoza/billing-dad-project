"use client";

import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { InvoiceDocument } from "@/lib/types/invoice.types";
import { formatDate } from "@/lib/helpers/date.helper";
import {
	getInvoiceTypeLabel,
	getInvoiceNumber,
} from "@/lib/helpers/invoice.helper";
import { FormSection } from "@/components/forms";

/**
 * Props for InvoiceView component
 */
export interface InvoiceViewProps {
	invoice: InvoiceDocument;
}

/**
 * Component to display invoice details in read-only mode
 */
export function InvoiceView({ invoice }: InvoiceViewProps) {
	const isUnbilled = invoice.invoiceType === "Unbilled";

	return (
		<div className="space-y-6">
			{/* Información de la factura */}
			<FormSection title="Información de la Factura">
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">
							Tipo de Factura
						</p>
						<Badge variant="outline">{getInvoiceTypeLabel(invoice.invoiceType)}</Badge>
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">Fecha</p>
						<p className="text-sm">{formatDate(invoice.date)}</p>
					</div>
					{!isUnbilled && invoice.pointOfSale && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Punto de Venta
							</p>
							<p className="text-sm font-mono">{invoice.pointOfSale}</p>
						</div>
					)}
					{!isUnbilled && invoice.invoiceNumber && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Número de Factura
							</p>
							<p className="text-sm font-mono">{getInvoiceNumber(invoice)}</p>
						</div>
					)}
				</div>
			</FormSection>

			{/* Datos del cliente */}
			<FormSection title="Datos del Cliente">
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">
							Razón Social
						</p>
						<p className="text-sm">{invoice.clientName}</p>
					</div>
					{invoice.clientTaxId && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">CUIT</p>
							<p className="text-sm font-mono">{invoice.clientTaxId}</p>
						</div>
					)}
					{invoice.clientTaxCondition && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Condición frente al IVA
							</p>
							<p className="text-sm">{invoice.clientTaxCondition}</p>
						</div>
					)}
					{invoice.clientAddress && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Dirección
							</p>
							<p className="text-sm">{invoice.clientAddress}</p>
						</div>
					)}
				</div>
			</FormSection>

			{/* Items */}
			<FormSection title="Items">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Descripción</TableHead>
							<TableHead className="text-right">Cantidad</TableHead>
							<TableHead className="text-right">Precio Unitario</TableHead>
							<TableHead className="text-right">IVA %</TableHead>
							<TableHead className="text-right">Subtotal</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{invoice.items.map((item, index) => {
							const itemSubtotal = item.quantity * item.unitPrice;
							const itemTax = itemSubtotal * (Number.parseFloat(item.taxRate) / 100);
							const itemTotal = itemSubtotal + itemTax;

							return (
								<TableRow key={index}>
									<TableCell>{item.description}</TableCell>
									<TableCell className="text-right">{item.quantity}</TableCell>
									<TableCell className="text-right">
										${item.unitPrice.toFixed(2)}
									</TableCell>
									<TableCell className="text-right">{item.taxRate}%</TableCell>
									<TableCell className="text-right">
										${itemTotal.toFixed(2)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</FormSection>

			{/* Totales */}
			<FormSection title="Totales" showSeparator={false}>
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">
							Condición de Venta
						</p>
						<p className="text-sm">{invoice.paymentCondition}</p>
					</div>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Subtotal:</span>
							<span className="text-sm">${invoice.subtotal.toFixed(2)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">IVA:</span>
							<span className="text-sm">${invoice.tax.toFixed(2)}</span>
						</div>
						<Separator />
						<div className="flex justify-between">
							<span className="text-sm font-semibold">Total:</span>
							<span className="text-sm font-semibold">
								${invoice.total.toFixed(2)}
							</span>
						</div>
					</div>
				</div>
			</FormSection>
		</div>
	);
}

