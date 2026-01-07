"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ClientSelector } from "@/components/clients/client-selector";
import type { ClientDocument } from "@/lib/types/client.types";
import type { InvoiceFormProps } from "@/lib/types/component.types";
// Import reusable components
import { FormSection, ItemsSection, InvoiceTotals } from "@/components/forms";
import { TaxIdField, TaxConditionField, AddressField } from "@/components/forms";
import { useItemsCalculations, useFiscalDataValidation, useEntityCreation } from "@/lib/hooks";
import { itemsArraySchema, taxConditionEnum, taxIdSchema, type TaxCondition } from "@/lib/schemas";

const invoiceSchema = z
	.object({
		invoiceType: z.enum(["A", "B", "C", "Unbilled"], {
			required_error: "Selecciona un tipo de factura",
		}),
		pointOfSale: z.string().optional(),
		invoiceNumber: z.string().optional(),
		date: z.string().min(1, "La fecha es requerida"),
		// Client data
		clientId: z.string().optional(), // Reference to client
		clientName: z.string().min(1, "La razón social es requerida"),
		clientTaxId: taxIdSchema.optional(),
		clientTaxCondition: taxConditionEnum.optional(),
		clientAddress: z.string().optional(),
		// Items - using shared schema
		items: itemsArraySchema,
		// Payment condition
		paymentCondition: z.enum(["Contado", "Tarjeta", "Transferencia", "Cheque"], {
			required_error: "Selecciona una condición de venta",
		}),
	})
	.superRefine((data, ctx) => {
		if (data.invoiceType !== "Unbilled") {
			if (!data.pointOfSale || data.pointOfSale.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "El punto de venta es requerido para facturas AFIP",
					path: ["pointOfSale"],
				});
			}
			if (!data.invoiceNumber || data.invoiceNumber.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "El número de factura es requerido para facturas AFIP",
					path: ["invoiceNumber"],
				});
			}
			if (!data.clientTaxId || data.clientTaxId.length < 11) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "El CUIT debe tener 11 dígitos para facturas AFIP",
					path: ["clientTaxId"],
				});
			}
			if (!data.clientTaxCondition) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "La condición frente al IVA es requerida para facturas AFIP",
					path: ["clientTaxCondition"],
				});
			}
		}
	});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export function InvoiceForm({
	onSubmit,
	onCancel,
	defaultValues,
	isEditing = false,
}: InvoiceFormProps) {
	const form = useForm<InvoiceFormValues>({
		resolver: zodResolver(invoiceSchema),
		defaultValues: defaultValues || {
			invoiceType: "Unbilled",
			pointOfSale: "",
			invoiceNumber: "",
			date: new Date().toISOString().split("T")[0],
			clientId: undefined,
			clientName: "",
			clientTaxId: "",
			clientTaxCondition: undefined,
			clientAddress: "",
			items: [
				{
					description: "",
					quantity: 1,
					unitPrice: 0,
					taxRate: "21",
				},
			],
			paymentCondition: "Contado",
		},
		mode: "onChange",
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});

	const invoiceType = form.watch("invoiceType");
	const isUnbilled = invoiceType === "Unbilled";

	// Use hook for fiscal data validation
	const { hasEnoughDataToCreate } = useFiscalDataValidation({
		form,
		nameField: "clientName",
		taxIdField: "clientTaxId",
		taxConditionField: "clientTaxCondition",
		requireFiscalData: !isUnbilled,
	});

	// Use hook for client creation
	const { createEntity: createClient } = useEntityCreation({
		form,
		nameField: "clientName",
		idField: "clientId",
		taxIdField: "clientTaxId",
		taxConditionField: "clientTaxCondition",
		addressField: "clientAddress",
		createEndpoint: "/api/clients",
		getEntityData: (formValues) => ({
			name: formValues.clientName,
			taxId: formValues.clientTaxId,
			taxCondition: formValues.clientTaxCondition,
			address: formValues.clientAddress,
		}),
		updateFormFields: (form, newClient, formValues) => {
			form.setValue("clientId", newClient._id as string);
			form.setValue("clientName", formValues.clientName || newClient.name);
			form.setValue("clientTaxId", formValues.clientTaxId || newClient.taxId || "");
			form.setValue("clientTaxCondition", (formValues.clientTaxCondition || newClient.taxCondition) as TaxCondition | undefined);
			form.setValue("clientAddress", formValues.clientAddress || newClient.address || "");
		},
		validationFields: ["clientName", "clientTaxId", "clientTaxCondition", "clientAddress"],
		nameRequiredMessage: "El nombre del cliente es requerido",
		creationErrorMessage: "Error al crear el cliente. Se creará automáticamente al guardar la factura.",
	});

	// Use reusable hook for calculations
	// Use useWatch to properly subscribe to changes in the items array
	const items = useWatch({
		control: form.control,
		name: "items",
		defaultValue: form.getValues("items"),
	});
	const { subtotal, tax, total } = useItemsCalculations(items);

	const defaultItem = {
		description: "",
		quantity: 1,
		unitPrice: 0,
		taxRate: "21" as const,
	};

	function handleSubmit(data: InvoiceFormValues) {
		onSubmit(data);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				{/* Información de la factura */}
				<FormSection title="Información de la Factura">
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
						<FormField
							control={form.control}
							name="invoiceType"
							render={({ field }) => (
								<FormItem className="min-h-[80px] flex flex-col">
									<FormLabel>Tipo de Factura</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Selecciona el tipo" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="Unbilled">
												Venta sin facturar
											</SelectItem>
											<SelectItem value="A">Factura A (RI a RI)</SelectItem>
											<SelectItem value="B">
												Factura B (RI a Consumidor Final)
											</SelectItem>
											<SelectItem value="C">Factura C (Monotributo)</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription className="text-xs mt-1">
										{isUnbilled
											? "Venta sin comprobante fiscal"
											: "Factura según normativa AFIP"}
									</FormDescription>
									<FormMessage className="text-xs mt-1 min-h-[16px]" />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="min-h-[80px] flex flex-col">
									<FormLabel>Fecha</FormLabel>
									<FormControl>
										<Input type="date" {...field} className="w-full" />
									</FormControl>
									<FormMessage className="text-xs mt-1 min-h-[16px]" />
								</FormItem>
							)}
						/>

						{!isUnbilled && (
							<>
								<FormField
									control={form.control}
									name="pointOfSale"
									render={({ field }) => (
										<FormItem className="min-h-[80px] flex flex-col">
											<FormLabel>Punto de Venta</FormLabel>
											<FormControl>
												<Input placeholder="0001" {...field} className="w-full" />
											</FormControl>
											<FormMessage className="text-xs mt-1 min-h-[16px]" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="invoiceNumber"
									render={({ field }) => (
										<FormItem className="min-h-[80px] flex flex-col">
											<FormLabel>Número de Factura</FormLabel>
											<FormControl>
												<Input
													placeholder="00000001"
													{...field}
													className="w-full"
												/>
											</FormControl>
											<FormMessage className="text-xs mt-1 min-h-[16px]" />
										</FormItem>
									)}
								/>
							</>
						)}
					</div>
				</FormSection>

				{/* Datos del cliente */}
				<FormSection title="Datos del Cliente">
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="clientName"
							render={() => (
								<FormItem className="min-h-[80px] flex flex-col">
									<FormLabel>Cliente</FormLabel>
									<FormControl>
										<ClientSelector
											value={form.watch("clientId")}
											onSelect={(client: ClientDocument | null) => {
												if (client) {
													// Complete ALL client data when selecting (including address)
													form.setValue("clientId", client._id as string);
													form.setValue("clientName", client.name);
													form.setValue("clientTaxId", client.taxId || "");
													form.setValue("clientTaxCondition", client.taxCondition || undefined);
													// Ensure address is set (even if empty string)
													form.setValue("clientAddress", client.address ?? "");
													// Trigger validation to clear any errors
													form.trigger(["clientName", "clientTaxId", "clientTaxCondition", "clientAddress"]);
												} else {
													form.setValue("clientId", undefined);
													// Keep clientName value when clearing selection (user might be typing)
												}
											}}
											onInputChange={(value: string) => {
												// Update clientName when user types manually
												form.setValue("clientName", value);
												form.setValue("clientId", undefined);
											}}
											onCreateNew={createClient}
											hasEnoughDataToCreate={hasEnoughDataToCreate}
											placeholder="Buscar o escribir nombre del cliente"
										/>
									</FormControl>
									<FormDescription className="text-xs mt-1">
										Busca por nombre o CUIT. Si escribes uno nuevo, se creará automáticamente al guardar la factura.
									</FormDescription>
									<FormMessage className="text-xs mt-1 min-h-[16px]" />
								</FormItem>
							)}
						/>

						{/* Use reusable fiscal info section */}
						{!isUnbilled && (
							<FormField
								control={form.control}
								name="clientTaxId"
								render={({ field }) => (
									<TaxIdField
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										field={field as any}
										required={!isUnbilled}
										maxLength={11}
									/>
								)}
							/>
						)}

						{!isUnbilled && (
							<FormField
								control={form.control}
								name="clientTaxCondition"
								render={({ field }) => (
									<TaxConditionField
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										field={field as any}
										required={!isUnbilled}
									/>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name="clientAddress"
							render={({ field }) => (
								<AddressField
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									field={field as any}
									required={false}
									className={isUnbilled ? "sm:col-span-2" : undefined}
								/>
							)}
						/>
					</div>
				</FormSection>

				{/* Items - using reusable component */}
				<ItemsSection
					fields={fields}
					onAdd={() => append(defaultItem)}
					onRemove={remove}
					control={form.control}
					title="Items"
				/>

				{/* Totales */}
				<FormSection title="Totales" showSeparator={false}>
					<div className="grid gap-4 md:grid-cols-2">
						<FormField
							control={form.control}
							name="paymentCondition"
							render={({ field }) => (
								<FormItem className="min-h-[80px] flex flex-col">
									<FormLabel>Condición de Venta</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Selecciona la condición" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="Contado">Contado</SelectItem>
											<SelectItem value="Tarjeta">Tarjeta</SelectItem>
											<SelectItem value="Transferencia">
												Transferencia
											</SelectItem>
											<SelectItem value="Cheque">Cheque</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage className="text-xs mt-1 min-h-[16px]" />
								</FormItem>
							)}
						/>

						{/* Use reusable totals component */}
						<InvoiceTotals subtotal={subtotal} tax={tax} total={total} />
					</div>
				</FormSection>

				{/* Botones */}
				<div className="flex justify-end gap-4">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancelar
					</Button>
					<Button type="submit">{isEditing ? "Guardar Cambios" : "Crear Factura"}</Button>
				</div>
			</form>
		</Form>
	);
}

