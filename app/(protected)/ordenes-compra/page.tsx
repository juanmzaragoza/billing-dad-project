"use client";

import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CrudListPage, CrudListPageActions } from "@/components/shared/crud-list-page";
import type { CrudListColumn } from "@/components/shared/crud-list-page";
import { PurchaseOrderView } from "@/components/purchase-orders/purchase-order-view";
import { PurchaseOrderForm } from "./purchase-order-form";
import type { PurchaseOrderDocument } from "@/lib/types/purchase-order.types";
import type { PurchaseOrderFormValues } from "@/lib/schemas/purchase-order.schemas";
import * as purchaseOrderActions from "./actions";
import { formatDate } from "@/lib/helpers/date.helper";

export default function OrdenesCompraPage() {
	// Define columns for the table
	const columns: CrudListColumn<PurchaseOrderDocument>[] = [
		{
			key: "orderNumber",
			header: "Número",
			render: (order) => (
				<span className="font-mono">{order.orderNumber}</span>
			),
		},
		{
			key: "date",
			header: "Fecha",
			render: (order) => formatDate(order.date),
		},
		{
			key: "supplierName",
			header: "Proveedor",
			render: (order) => order.supplierName,
		},
		{
			key: "status",
			header: "Estado",
			render: (order) => (
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
			),
		},
		{
			key: "subtotal",
			header: "Subtotal",
			render: (order) => `$${order.subtotal.toFixed(2)}`,
		},
		{
			key: "tax",
			header: "IVA",
			render: (order) => `$${order.tax.toFixed(2)}`,
		},
		{
			key: "total",
			header: "Total",
			render: (order) => (
				<span className="font-semibold">${order.total.toFixed(2)}</span>
			),
		},
		{
			key: "paymentCondition",
			header: "Condición",
			render: (order) => order.paymentCondition,
		},
	];

	return (
		<CrudListPage<PurchaseOrderDocument, PurchaseOrderFormValues>
			title="Órdenes de Compra"
			description="Administra tus órdenes de compra y pedidos"
			icon={ShoppingCart}
			newButtonLabel="Nueva Orden"
			createDialogTitle="Nueva Orden de Compra"
			createDialogDescription="Completa los datos para crear una nueva orden de compra"
			fetchItems={purchaseOrderActions.getAllPurchaseOrders}
			onCreate={purchaseOrderActions.createPurchaseOrder}
			onDelete={async (order) => {
				const id = order._id?.toString();
				if (!id) throw new Error("ID de orden inválido");
				await purchaseOrderActions.deletePurchaseOrder(id);
			}}
			getItemId={(order) => order._id?.toString()}
			getDisplayName={(order) =>
				`Proveedor: ${order.supplierName} - Total: $${order.total.toFixed(2)}`
			}
			columns={columns}
			formComponent={({ onSubmit, onCancel }) => (
				<PurchaseOrderForm onSubmit={onSubmit} onCancel={onCancel} />
			)}
			viewComponent={({ item }) => <PurchaseOrderView order={item} />}
			getViewTitle={(order) => `Orden de Compra ${order.orderNumber}`}
			getViewDescription={(order) =>
				`Detalles de la orden para ${order.supplierName}`
			}
			renderActions={(order, onDelete, onView) => (
				<CrudListPageActions onView={onView} onDelete={onDelete} />
			)}
		/>
	);
}
