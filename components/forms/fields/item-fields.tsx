"use client";

import { Trash2 } from "lucide-react";
import type { FieldValues } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ItemFieldsProps } from "./fields.types";

/**
 * Reusable fields for a single item (description, quantity, price, tax)
 * Can be used in invoice and purchase order forms
 */
export function ItemFields<TFieldValues extends FieldValues = FieldValues>({
	field,
	index,
	control,
	onRemove,
	canRemove = true,
}: ItemFieldsProps<TFieldValues>) {
	return (
		<div className="grid gap-4 p-4 border rounded-lg md:grid-cols-5">
			<FormField
				control={control}
				name={`items.${index}.description`}
				render={({ field: formField }) => (
					<FormItem className="md:col-span-2 min-h-[80px] flex flex-col">
						<FormLabel>Descripción</FormLabel>
						<FormControl>
							<Input
								placeholder="Producto o servicio"
								{...formField}
								className="w-full"
							/>
						</FormControl>
						<FormMessage className="text-xs mt-1 min-h-[16px]" />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name={`items.${index}.quantity`}
				render={({ field: formField }) => (
					<FormItem className="min-h-[80px] flex flex-col">
						<FormLabel>Cantidad</FormLabel>
						<FormControl>
							<Input
								type="number"
								step="0.01"
								min="0.01"
								{...formField}
								onChange={(e) =>
									formField.onChange(parseFloat(e.target.value) || 0)
								}
								className="w-full"
							/>
						</FormControl>
						<FormMessage className="text-xs mt-1 min-h-[16px]" />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name={`items.${index}.unitPrice`}
				render={({ field: formField }) => (
					<FormItem className="min-h-[80px] flex flex-col">
						<FormLabel>Precio Unitario</FormLabel>
						<FormControl>
							<Input
								type="number"
								step="0.01"
								min="0"
								{...formField}
								onChange={(e) =>
									formField.onChange(parseFloat(e.target.value) || 0)
								}
								className="w-full"
							/>
						</FormControl>
						<FormMessage className="text-xs mt-1 min-h-[16px]" />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name={`items.${index}.taxRate`}
				render={({ field: formField }) => (
					<FormItem className="min-h-[80px] flex flex-col">
						<FormLabel>IVA %</FormLabel>
						<Select
							onValueChange={formField.onChange}
							defaultValue={formField.value}
						>
							<FormControl>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								<SelectItem value="0">0%</SelectItem>
								<SelectItem value="10.5">10.5%</SelectItem>
								<SelectItem value="21">21%</SelectItem>
							</SelectContent>
						</Select>
						<FormMessage className="text-xs mt-1 min-h-[16px]" />
					</FormItem>
				)}
			/>

			{canRemove && onRemove && (
				<div className="flex items-end">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={onRemove}
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</Button>
				</div>
			)}
		</div>
	);
}

