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
import type { PurchaseOrderDocument } from "@/lib/types/purchase-order.types";
import { formatDate } from "@/lib/helpers/date.helper";
import { FormSection } from "@/components/forms";

/**
 * Props for PurchaseOrderView component
 */
export interface PurchaseOrderViewProps {
	order: PurchaseOrderDocument;
}

/**
 * Component to display purchase order details in read-only mode
 */
export function PurchaseOrderView({ order }: PurchaseOrderViewProps) {
	return (
		<div className="space-y-6">
			{/* Información de la orden */}
			<FormSection title="Información de la Orden">
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">
							Número de Orden
						</p>
						<p className="text-sm font-mono">{order.orderNumber}</p>
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">Fecha</p>
						<p className="text-sm">{formatDate(order.date)}</p>
					</div>
					{order.deliveryDate && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Fecha de Entrega
							</p>
							<p className="text-sm">{formatDate(order.deliveryDate)}</p>
						</div>
					)}
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">Estado</p>
						<Badge
							variant={
								order.status === "Completada"
									? "default"
									: order.status === "En Proceso"
										? "secondary"
										: "outline"
							}
						>
							{order.status}
						</Badge>
					</div>
				</div>
			</FormSection>

			{/* Datos del proveedor */}
			<FormSection title="Datos del Proveedor">
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">
							Razón Social
						</p>
						<p className="text-sm">{order.supplierName}</p>
					</div>
					{order.supplierTaxId && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">CUIT</p>
							<p className="text-sm font-mono">{order.supplierTaxId}</p>
						</div>
					)}
					{order.supplierTaxCondition && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Condición frente al IVA
							</p>
							<p className="text-sm">{order.supplierTaxCondition}</p>
						</div>
					)}
					{order.supplierAddress && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Dirección
							</p>
							<p className="text-sm">{order.supplierAddress}</p>
						</div>
					)}
				</div>
			</FormSection>

			{/* Items */}
			<FormSection title="Productos/Servicios">
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
						{order.items.map((item, index) => {
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
							Condición de Pago
						</p>
						<p className="text-sm">{order.paymentCondition}</p>
					</div>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Subtotal:</span>
							<span className="text-sm">${order.subtotal.toFixed(2)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">IVA:</span>
							<span className="text-sm">${order.tax.toFixed(2)}</span>
						</div>
						<Separator />
						<div className="flex justify-between">
							<span className="text-sm font-semibold">Total:</span>
							<span className="text-sm font-semibold">
								${order.total.toFixed(2)}
							</span>
						</div>
					</div>
				</div>
			</FormSection>

			{/* Notas */}
			{order.notes && (
				<FormSection title="Notas Adicionales" showSeparator={false}>
					<div>
						<p className="text-sm whitespace-pre-wrap">{order.notes}</p>
					</div>
				</FormSection>
			)}
		</div>
	);
}

