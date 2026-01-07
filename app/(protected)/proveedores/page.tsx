"use client";

import { Building2 } from "lucide-react";
import { CrudListPage, CrudListPageActions } from "@/components/shared/crud-list-page";
import type { CrudListColumn } from "@/components/shared/crud-list-page";
import { SupplierView } from "@/components/suppliers/supplier-view";
import { SupplierForm } from "./supplier-form";
import type { SupplierDocument } from "@/lib/types/supplier.types";
import type { SupplierFormValues } from "./supplier-form";
import * as supplierActions from "./actions";

export default function ProveedoresPage() {
	// Define columns for the table
	const columns: CrudListColumn<SupplierDocument>[] = [
		{
			key: "name",
			header: "Nombre / Razón Social",
			render: (supplier) => (
				<span className="font-medium">{supplier.name}</span>
			),
		},
		{
			key: "taxId",
			header: "CUIT",
			render: (supplier) =>
				supplier.taxId ? (
					<span className="font-mono">{supplier.taxId}</span>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			key: "taxCondition",
			header: "Condición IVA",
			render: (supplier) =>
				supplier.taxCondition ? (
					<span>{supplier.taxCondition}</span>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			key: "email",
			header: "Email",
			render: (supplier) =>
				supplier.email ? (
					<span>{supplier.email}</span>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			key: "phone",
			header: "Teléfono",
			render: (supplier) =>
				supplier.phone ? (
					<span>{supplier.phone}</span>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			key: "contactPerson",
			header: "Contacto",
			render: (supplier) =>
				supplier.contactPerson ? (
					<span>{supplier.contactPerson}</span>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			key: "address",
			header: "Dirección",
			render: (supplier) =>
				supplier.address ? (
					<span className="text-sm">{supplier.address}</span>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
	];

	return (
		<CrudListPage<SupplierDocument, SupplierFormValues>
			title="Proveedores"
			description="Gestiona tu base de datos de proveedores"
			icon={Building2}
			newButtonLabel="Nuevo Proveedor"
			createDialogTitle="Nuevo Proveedor"
			createDialogDescription="Completa los datos para crear un nuevo proveedor"
			fetchItems={supplierActions.getAllSuppliers}
			onCreate={supplierActions.createSupplier}
			onUpdate={async (id, data) => {
				return await supplierActions.updateSupplier(id, data);
			}}
			itemToFormValues={(supplier) => ({
				name: supplier.name,
				taxId: supplier.taxId || "",
				taxCondition: supplier.taxCondition,
				address: supplier.address || "",
				email: supplier.email || "",
				phone: supplier.phone || "",
				contactPerson: supplier.contactPerson || "",
				notes: supplier.notes || "",
			})}
			onDelete={async (supplier) => {
				const id = supplier._id?.toString();
				if (!id) throw new Error("ID de proveedor inválido");
				await supplierActions.deleteSupplier(id);
			}}
			getItemId={(supplier) => supplier._id?.toString()}
			getDisplayName={(supplier) => supplier.name}
			columns={columns}
			formComponent={({ onSubmit, onCancel, defaultValues, isEditing }) => (
				<SupplierForm onSubmit={onSubmit} onCancel={onCancel} defaultValues={defaultValues} isEditing={isEditing} />
			)}
			editDialogTitle="Editar Proveedor"
			editDialogDescription="Modifica los datos del proveedor"
			viewComponent={({ item }) => <SupplierView supplier={item} />}
			getViewTitle={(supplier) => supplier.name}
			getViewDescription={(supplier) =>
				`Detalles del proveedor ${supplier.name}`
			}
			renderActions={(supplier, onDelete, onView, onEdit) => (
				<CrudListPageActions onView={onView} onEdit={onEdit} onDelete={onDelete} />
			)}
		/>
	);
}


