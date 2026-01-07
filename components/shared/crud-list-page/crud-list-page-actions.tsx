"use client";

import { Eye, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CrudListPageActionsProps } from "./crud-list-page-actions.types";

/**
 * Standard actions component for CRUD list pages
 * Provides View, Edit, and Delete buttons with consistent styling
 */
export function CrudListPageActions({
	onView,
	onEdit,
	onDelete,
}: CrudListPageActionsProps) {
	return (
		<div className="flex justify-end gap-2">
			{onView && (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={onView}
					title="Ver detalles"
				>
					<Eye className="h-4 w-4" />
				</Button>
			)}
			{onEdit && (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={onEdit}
					title="Editar"
				>
					<Pencil className="h-4 w-4" />
				</Button>
			)}
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 text-destructive hover:text-destructive"
				onClick={onDelete}
				title="Eliminar"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}

