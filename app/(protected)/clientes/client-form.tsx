"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TaxIdField, TaxConditionField, AddressField } from "@/components/forms";
import { FormSection } from "@/components/forms";
import { taxConditionEnum, taxIdSchema } from "@/lib/schemas";
import type { InvoiceFormProps } from "@/lib/types/component.types";

const clientSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	taxId: taxIdSchema.optional(),
	taxCondition: taxConditionEnum.optional(),
	address: z.string().optional(),
	email: z.string().email("Email inválido").optional().or(z.literal("")),
	phone: z.string().optional(),
	notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientForm({
	onSubmit,
	onCancel,
	defaultValues,
	isEditing = false,
}: InvoiceFormProps<ClientFormValues>) {
	const form = useForm<ClientFormValues>({
		resolver: zodResolver(clientSchema),
		defaultValues: defaultValues || {
			name: "",
			taxId: "",
			taxCondition: undefined,
			address: "",
			email: "",
			phone: "",
			notes: "",
		},
		mode: "onChange",
	});

	function handleSubmit(data: ClientFormValues) {
		onSubmit(data);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				{/* Basic Information */}
				<FormSection title="Información Básica">
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="min-h-[80px] flex flex-col">
									<FormLabel>Nombre / Razón Social</FormLabel>
									<FormControl>
										<Input placeholder="Nombre del cliente" {...field} />
									</FormControl>
									<FormDescription className="text-xs mt-1">
										Nombre completo o razón social del cliente
									</FormDescription>
									<FormMessage className="text-xs mt-1 min-h-[16px]" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="taxId"
							render={({ field }) => (
								<TaxIdField
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									field={field as any}
									required={false}
									maxLength={11}
								/>
							)}
						/>

						<FormField
							control={form.control}
							name="taxCondition"
							render={({ field }) => (
								<TaxConditionField
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									field={field as any}
									required={false}
								/>
							)}
						/>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<AddressField
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									field={field as any}
									required={false}
								/>
							)}
						/>
					</div>
				</FormSection>

				{/* Contact Information */}
				<FormSection title="Información de Contacto">
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="min-h-[80px] flex flex-col">
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="cliente@ejemplo.com"
											{...field}
											value={field.value || ""}
										/>
									</FormControl>
									<FormMessage className="text-xs mt-1 min-h-[16px]" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem className="min-h-[80px] flex flex-col">
									<FormLabel>Teléfono</FormLabel>
									<FormControl>
										<Input
											type="tel"
											placeholder="+54 11 1234-5678"
											{...field}
											value={field.value || ""}
										/>
									</FormControl>
									<FormMessage className="text-xs mt-1 min-h-[16px]" />
								</FormItem>
							)}
						/>
					</div>
				</FormSection>

				{/* Notes */}
				<FormSection title="Notas Adicionales" showSeparator={false}>
					<FormField
						control={form.control}
						name="notes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Notas</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Información adicional sobre el cliente..."
										className="min-h-[100px]"
										{...field}
										value={field.value || ""}
									/>
								</FormControl>
								<FormDescription className="text-xs mt-1">
									Información adicional o comentarios sobre el cliente
								</FormDescription>
								<FormMessage className="text-xs mt-1 min-h-[16px]" />
							</FormItem>
						)}
					/>
				</FormSection>

				{/* Buttons */}
				<div className="flex justify-end gap-4">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancelar
					</Button>
					<Button type="submit">{isEditing ? "Guardar Cambios" : "Crear Cliente"}</Button>
				</div>
			</form>
		</Form>
	);
}


