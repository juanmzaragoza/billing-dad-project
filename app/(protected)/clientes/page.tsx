"use client";

import { Users } from "lucide-react";
import { CrudListPage, CrudListPageActions } from "@/components/shared/crud-list-page";
import type { CrudListColumn } from "@/components/shared/crud-list-page";
import { ClientView } from "@/components/clients/client-view";
import { ClientForm } from "./client-form";
import type { ClientDocument } from "@/lib/types/client.types";
import type { ClientFormValues } from "./client-form";
import * as clientActions from "./actions";

export default function ClientesPage() {
	// Define columns for the table
	const columns: CrudListColumn<ClientDocument>[] = [
		{
			key: "name",
			header: "Nombre / Razón Social",
			render: (client) => <span className="font-medium">{client.name}</span>,
		},
		{
			key: "taxId",
			header: "CUIT",
			render: (client) =>
				client.taxId ? (
					<span className="font-mono">{client.taxId}</span>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			key: "taxCondition",
			header: "Condición IVA",
			render: (client) =>
				client.taxCondition ? (
					<span>{client.taxCondition}</span>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			key: "email",
			header: "Email",
			render: (client) =>
				client.email ? (
					<span>{client.email}</span>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			key: "phone",
			header: "Teléfono",
			render: (client) =>
				client.phone ? (
					<span>{client.phone}</span>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			key: "address",
			header: "Dirección",
			render: (client) =>
				client.address ? (
					<span className="text-sm">{client.address}</span>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
	];

	return (
		<CrudListPage<ClientDocument, ClientFormValues>
			title="Clientes"
			description="Gestiona tu base de datos de clientes"
			icon={Users}
			newButtonLabel="Nuevo Cliente"
			createDialogTitle="Nuevo Cliente"
			createDialogDescription="Completa los datos para crear un nuevo cliente"
			fetchItems={clientActions.getAllClients}
			onCreate={clientActions.createClient}
			onDelete={async (client) => {
				const id = client._id?.toString();
				if (!id) throw new Error("ID de cliente inválido");
				await clientActions.deleteClient(id);
			}}
			getItemId={(client) => client._id?.toString()}
			getDisplayName={(client) => client.name}
			columns={columns}
			formComponent={({ onSubmit, onCancel }) => (
				<ClientForm onSubmit={onSubmit} onCancel={onCancel} />
			)}
			viewComponent={({ item }) => <ClientView client={item} />}
			getViewTitle={(client) => client.name}
			getViewDescription={(client) => `Detalles del cliente ${client.name}`}
			renderActions={(client, onDelete, onView) => (
				<CrudListPageActions onView={onView} onDelete={onDelete} />
			)}
		/>
	);
}


