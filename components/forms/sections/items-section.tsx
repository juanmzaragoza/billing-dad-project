"use client";

import { Plus } from "lucide-react";
import type { FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormSection } from "./form-section";
import { ItemFields } from "../fields/item-fields";
import type { ItemsSectionProps } from "./sections.types";

/**
 * Reusable section for items list with add/remove functionality
 * Can be used in invoice and purchase order forms
 */
export function ItemsSection<TFieldValues extends FieldValues = FieldValues>({
	fields,
	onAdd,
	onRemove,
	control,
	title = "Items",
	showSeparator = true,
}: ItemsSectionProps<TFieldValues>) {
	return (
		<FormSection title={title} showSeparator={showSeparator}>
			<div className="flex items-center justify-between mb-4">
				<div />
				<Button type="button" variant="outline" size="sm" onClick={onAdd}>
					<Plus className="mr-2 h-4 w-4" />
					Agregar Item
				</Button>
			</div>

			<div className="space-y-4">
				{fields.map((field, index) => (
					<ItemFields<TFieldValues>
						key={field.id}
						field={field}
						index={index}
						control={control}
						onRemove={() => onRemove(index)}
						canRemove={fields.length > 1}
					/>
				))}
			</div>
		</FormSection>
	);
}
