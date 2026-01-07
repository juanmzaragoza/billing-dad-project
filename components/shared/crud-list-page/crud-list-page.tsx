"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ViewDialog } from "@/components/shared/view-dialog";
import type { CrudListPageProps } from "./crud-list-page.types";

/**
 * Generic CRUD list page component
 * Reusable for invoices, purchase orders, clients, suppliers, etc.
 */
export function CrudListPage<T, TFormValues extends Record<string, unknown> = Record<string, unknown>>({
	title,
	description,
	icon: Icon,
	newButtonLabel,
	createDialogTitle,
	createDialogDescription,
	editDialogTitle,
	editDialogDescription,
	fetchItems,
	onCreate,
	onUpdate,
	itemToFormValues,
	onDelete,
	getItemId,
	getDisplayName,
	columns,
	formComponent,
	emptyStateMessage,
	emptyStateHelperText,
	renderActions,
	deleteConfirmationMessage,
	viewComponent,
	getViewTitle,
	getViewDescription,
	onPrint,
}: CrudListPageProps<T, TFormValues>) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<T | null>(null);
	const [editingItem, setEditingItem] = useState<T | null>(null);
	const [items, setItems] = useState<T[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const loadItems = useCallback(async () => {
		try {
			const data = await fetchItems();
			setItems(data);
		} catch (error) {
			console.error(`Error fetching ${title.toLowerCase()}:`, error);
			toast.error(`Error al cargar ${title.toLowerCase()}`, {
				description:
					error instanceof Error
						? error.message
						: "Ocurrió un error inesperado",
			});
		} finally {
			setIsLoading(false);
		}
	}, [fetchItems, title]);

	useEffect(() => {
		loadItems();
	}, [loadItems]);

	const handleSubmit = async (data: TFormValues) => {
		try {
			const createdItem = await onCreate(data);

			toast.success(`${title.slice(0, -1)} cread${title.slice(-1) === "s" ? "a" : "o"} exitosamente`, {
				description: getDisplayName(createdItem),
				duration: 5000,
			});

			setIsDialogOpen(false);
			await loadItems();
		} catch (error) {
			console.error(`Error creating ${title.toLowerCase()}:`, error);
			const errorMessage =
				error instanceof Error ? error.message : "Ocurrió un error inesperado";

			toast.error(`Error al crear ${title.toLowerCase()}`, {
				description: errorMessage,
				duration: 5000,
			});
		}
	};

	const handleUpdate = async (data: TFormValues | Partial<TFormValues>) => {
		if (!editingItem || !onUpdate || !itemToFormValues) return;

		const id = getItemId(editingItem);
		if (!id) {
			toast.error("Error", {
				description: `ID de ${title.slice(0, -1).toLowerCase()} inválido`,
			});
			return;
		}

		try {
			const updatedItem = await onUpdate(id, data);

			toast.success(`${title.slice(0, -1)} actualizad${title.slice(-1) === "s" ? "a" : "o"} exitosamente`, {
				description: getDisplayName(updatedItem),
				duration: 5000,
			});

			setIsEditDialogOpen(false);
			setEditingItem(null);
			await loadItems();
		} catch (error) {
			console.error(`Error updating ${title.toLowerCase()}:`, error);
			const errorMessage =
				error instanceof Error ? error.message : "Ocurrió un error inesperado";

			toast.error(`Error al actualizar ${title.toLowerCase()}`, {
				description: errorMessage,
				duration: 5000,
			});
		}
	};

	const handleEdit = (item: T) => {
		setEditingItem(item);
		setIsEditDialogOpen(true);
	};

	const handleDelete = async (item: T) => {
		const confirmationMessage = deleteConfirmationMessage
			? deleteConfirmationMessage(item)
			: `¿Estás seguro de que deseas eliminar este/a ${title.slice(0, -1).toLowerCase()}?`;

		if (!confirm(confirmationMessage)) {
			return;
		}

		const id = getItemId(item);
		if (!id) {
			toast.error("Error", {
				description: `ID de ${title.slice(0, -1).toLowerCase()} inválido`,
			});
			return;
		}

		try {
			await onDelete(item);
			toast.success(`${title.slice(0, -1)} eliminad${title.slice(-1) === "s" ? "a" : "o"} exitosamente`);
			await loadItems();
		} catch (error) {
			console.error(`Error deleting ${title.toLowerCase()}:`, error);
			toast.error(`Error al eliminar ${title.toLowerCase()}`, {
				description:
					error instanceof Error
						? error.message
						: "Ocurrió un error inesperado",
			});
		}
	};

	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-4xl font-bold tracking-tight">{title}</h1>
					<p className="text-muted-foreground text-lg">{description}</p>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							{newButtonLabel}
						</Button>
					</DialogTrigger>
					<DialogContent className="!max-w-[90vw] lg:!max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw]">
						<DialogHeader>
							<DialogTitle>{createDialogTitle}</DialogTitle>
							<DialogDescription>
								{createDialogDescription}
							</DialogDescription>
						</DialogHeader>
						{formComponent({
							onSubmit: handleSubmit,
							onCancel: () => setIsDialogOpen(false),
							isEditing: false,
						})}
					</DialogContent>
				</Dialog>

				{/* Edit Dialog */}
				{onUpdate && itemToFormValues && (
					<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
						<DialogContent className="!max-w-[90vw] lg:!max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw]">
							<DialogHeader>
								<DialogTitle>
									{editDialogTitle || `Editar ${title.slice(0, -1)}`}
								</DialogTitle>
								<DialogDescription>
									{editDialogDescription || `Modifica los datos del ${title.slice(0, -1).toLowerCase()}`}
								</DialogDescription>
							</DialogHeader>
							{editingItem && formComponent({
								onSubmit: handleUpdate,
								onCancel: () => {
									setIsEditDialogOpen(false);
									setEditingItem(null);
								},
								defaultValues: itemToFormValues(editingItem),
								isEditing: true,
							})}
						</DialogContent>
					</Dialog>
				)}
			</div>

			{/* Content Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Icon className="h-5 w-5" />
						Lista de {title}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<p className="text-muted-foreground">
								Cargando {title.toLowerCase()}...
							</p>
						</div>
					) : items.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Icon className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-muted-foreground">
								{emptyStateMessage ||
									`No hay ${title.toLowerCase()} registrad${title.slice(-1) === "s" ? "as" : "os"} aún`}
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								{emptyStateHelperText ||
									`Crea tu primer${title.slice(-1) === "s" ? "a" : ""} ${title.slice(0, -1).toLowerCase()} para comenzar`}
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									{columns.map((column) => (
										<TableHead
											key={column.key}
											className={column.className}
										>
											{column.header}
										</TableHead>
									))}
									{renderActions && (
										<TableHead className="text-right">Acciones</TableHead>
									)}
								</TableRow>
							</TableHeader>
							<TableBody>
								{items.map((item) => (
									<TableRow
										key={getItemId(item) || Math.random()}
									>
										{columns.map((column) => (
											<TableCell
												key={column.key}
												className={column.className}
											>
												{column.render(item)}
											</TableCell>
										))}
										{renderActions && (
											<TableCell className="text-right">
												{renderActions(
													item,
													() => handleDelete(item),
													viewComponent
														? () => {
																setSelectedItem(item);
																setIsViewDialogOpen(true);
															}
														: undefined,
													onUpdate && itemToFormValues
														? () => handleEdit(item)
														: undefined,
												)}
											</TableCell>
										)}
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* View Dialog */}
			{viewComponent && selectedItem && (
				<ViewDialog
					title={
						getViewTitle
							? getViewTitle(selectedItem)
							: `Ver ${title.slice(0, -1)}`
					}
					description={
						getViewDescription
							? getViewDescription(selectedItem)
							: `Detalles del ${title.slice(0, -1).toLowerCase()}`
					}
					isOpen={isViewDialogOpen}
					onClose={() => {
						setIsViewDialogOpen(false);
						setSelectedItem(null);
					}}
					onPrint={onPrint ? () => onPrint(selectedItem) : undefined}
					showActions={!!onPrint}
				>
					{viewComponent({ item: selectedItem })}
				</ViewDialog>
			)}
		</div>
	);
}

