"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { ClientSelector } from "@/components/clients/client-selector";
import type { ClientDocument } from "@/lib/types/client.types";
import type { InvoiceFormProps } from "@/lib/types/component.types";

// Invoice validation schema for Argentina
const invoiceItemSchema = z.object({
	description: z.string().min(1, "La descripción es requerida"),
	quantity: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
	unitPrice: z.number().min(0, "El precio debe ser mayor o igual a 0"),
	taxRate: z.enum(["0", "10.5", "21"], {
		required_error: "Selecciona una alícuota de IVA",
	}),
});

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
		clientTaxId: z.string().optional(),
		clientTaxCondition: z
			.enum(
				["Responsable Inscripto", "Consumidor Final", "Exento", "Monotributo"],
				{
					required_error: "Selecciona la condición frente al IVA",
				},
			)
			.optional(),
		clientAddress: z.string().optional(),
		// Items
		items: z.array(invoiceItemSchema).min(1, "Debe haber al menos un item"),
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

	// Check if there's enough data to create a client
	const hasEnoughDataToCreate = (): boolean => {
		const clientName = form.watch("clientName");
		// For unbilled invoices, only name is required
		if (isUnbilled) {
			return !!(clientName && clientName.trim().length > 0);
		}
		// For AFIP invoices, need at least name + (taxId OR taxCondition)
		const clientTaxId = form.watch("clientTaxId");
		const clientTaxCondition = form.watch("clientTaxCondition");
		return !!(
			clientName &&
			clientName.trim().length > 0 &&
			(clientTaxId?.trim() || clientTaxCondition)
		);
	};

	const calculateSubtotal = () => {
		const items = form.watch("items");
		return items.reduce(
			(sum, item) => sum + item.quantity * item.unitPrice,
			0,
		);
	};

	const calculateTax = () => {
		const items = form.watch("items");
		return items.reduce((sum, item) => {
			const itemSubtotal = item.quantity * item.unitPrice;
			const taxRate = parseFloat(item.taxRate);
			return sum + (itemSubtotal * taxRate) / 100;
		}, 0);
	};

	const calculateTotal = () => {
		return calculateSubtotal() + calculateTax();
	};

	function handleSubmit(data: InvoiceFormValues) {
		onSubmit(data);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				{/* Información de la factura */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Información de la Factura</h3>
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
				</div>

				<Separator />

				{/* Datos del cliente */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Datos del Cliente</h3>
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
											onCreateNew={async () => {
												// Create client immediately with current form data
												// Get all current form values
												const formValues = form.getValues();
												const clientName = formValues.clientName;
												const clientTaxId = formValues.clientTaxId;
												const clientTaxCondition = formValues.clientTaxCondition;
												const clientAddress = formValues.clientAddress;

												if (!clientName || clientName.trim().length === 0) {
													form.setError("clientName", {
														type: "manual",
														message: "El nombre del cliente es requerido",
													});
													return;
												}

												try {
													const response = await fetch("/api/clients", {
														method: "POST",
														headers: { "Content-Type": "application/json" },
														body: JSON.stringify({
															name: clientName.trim(),
															taxId: clientTaxId?.trim() || undefined,
															taxCondition: clientTaxCondition || undefined,
															address: clientAddress?.trim() || undefined,
														}),
													});

													if (!response.ok) {
														throw new Error("Error al crear el cliente");
													}

													const newClient = await response.json();
													// Select the newly created client BUT preserve form values
													// This ensures that if user typed more data, it's not lost
													form.setValue("clientId", newClient._id as string);
													// Keep the form values (they might have more data than what was saved)
													// Only update if the saved client has data that form doesn't have
													form.setValue("clientName", clientName || newClient.name);
													form.setValue("clientTaxId", clientTaxId || newClient.taxId || "");
													form.setValue("clientTaxCondition", clientTaxCondition || newClient.taxCondition || undefined);
													form.setValue("clientAddress", clientAddress || newClient.address || "");
													// Trigger validation to update form state
													form.trigger(["clientName", "clientTaxId", "clientTaxCondition", "clientAddress"]);
												} catch (error) {
													console.error("Error creating client:", error);
													form.setError("clientName", {
														type: "manual",
														message: "Error al crear el cliente. Se creará automáticamente al guardar la factura.",
													});
												}
											}}
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

						{!isUnbilled && (
							<FormField
								control={form.control}
								name="clientTaxId"
								render={({ field }) => (
									<FormItem className="min-h-[80px] flex flex-col">
										<FormLabel>CUIT/CUIL/DNI</FormLabel>
										<FormControl>
											<Input
												placeholder="20123456789"
												maxLength={11}
												{...field}
												className="w-full"
												onChange={(e) => {
													field.onChange(e);
													// Clear clientId if manually editing tax ID
													if (form.watch("clientId")) {
														form.setValue("clientId", undefined);
													}
												}}
											/>
										</FormControl>
										<FormMessage className="text-xs mt-1 min-h-[16px]" />
									</FormItem>
								)}
							/>
						)}

						{!isUnbilled && (
							<FormField
								control={form.control}
								name="clientTaxCondition"
								render={({ field }) => (
									<FormItem className="min-h-[80px] flex flex-col">
										<FormLabel>Condición frente al IVA</FormLabel>
										<Select
											onValueChange={(value) => {
												field.onChange(value);
												// Clear clientId if manually editing tax condition
												if (form.watch("clientId")) {
													form.setValue("clientId", undefined);
												}
											}}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Selecciona la condición" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="Responsable Inscripto">
													Responsable Inscripto
												</SelectItem>
												<SelectItem value="Consumidor Final">
													Consumidor Final
												</SelectItem>
												<SelectItem value="Exento">Exento</SelectItem>
												<SelectItem value="Monotributo">Monotributo</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage className="text-xs mt-1 min-h-[16px]" />
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name="clientAddress"
							render={({ field }) => (
								<FormItem className={`min-h-[80px] flex flex-col ${isUnbilled ? "sm:col-span-2" : ""}`}>
									<FormLabel>Domicilio {isUnbilled && "(Opcional)"}</FormLabel>
									<FormControl>
										<Input
											placeholder="Calle, número, ciudad"
											{...field}
											className="w-full"
											onChange={(e) => {
												field.onChange(e);
												// Clear clientId if manually editing address
												if (form.watch("clientId")) {
													form.setValue("clientId", undefined);
												}
											}}
										/>
									</FormControl>
									<FormMessage className="text-xs mt-1 min-h-[16px]" />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<Separator />

				{/* Items */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">Items</h3>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								append({
									description: "",
									quantity: 1,
									unitPrice: 0,
									taxRate: "21",
								})
							}
						>
							<Plus className="mr-2 h-4 w-4" />
							Agregar Item
						</Button>
					</div>

					<div className="space-y-4">
						{fields.map((field, index) => (
							<div
								key={field.id}
								className="grid gap-4 p-4 border rounded-lg md:grid-cols-5"
							>
								<FormField
									control={form.control}
									name={`items.${index}.description`}
									render={({ field }) => (
										<FormItem className="md:col-span-2 min-h-[80px] flex flex-col">
											<FormLabel>Descripción</FormLabel>
											<FormControl>
												<Input
													placeholder="Producto o servicio"
													{...field}
													className="w-full"
												/>
											</FormControl>
											<FormMessage className="text-xs mt-1 min-h-[16px]" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name={`items.${index}.quantity`}
									render={({ field }) => (
										<FormItem className="min-h-[80px] flex flex-col">
											<FormLabel>Cantidad</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													min="0.01"
													{...field}
													onChange={(e) =>
														field.onChange(parseFloat(e.target.value) || 0)
													}
													className="w-full"
												/>
											</FormControl>
											<FormMessage className="text-xs mt-1 min-h-[16px]" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name={`items.${index}.unitPrice`}
									render={({ field }) => (
										<FormItem className="min-h-[80px] flex flex-col">
											<FormLabel>Precio Unitario</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													min="0"
													{...field}
													onChange={(e) =>
														field.onChange(parseFloat(e.target.value) || 0)
													}
													className="w-full"
												/>
											</FormControl>
											<FormMessage className="text-xs mt-1 min-h-[16px]" />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name={`items.${index}.taxRate`}
									render={({ field }) => (
										<FormItem className="min-h-[80px] flex flex-col">
											<FormLabel>IVA %</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
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

								{fields.length > 1 && (
									<div className="flex items-end">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => remove(index)}
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				<Separator />

				{/* Totales */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">Totales</h3>
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

						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Subtotal:</span>
								<span className="font-medium">
									${calculateSubtotal().toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">IVA:</span>
								<span className="font-medium">
									${calculateTax().toFixed(2)}
								</span>
							</div>
							<Separator />
							<div className="flex justify-between text-lg font-bold">
								<span>Total:</span>
								<span>${calculateTotal().toFixed(2)}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Botones */}
				<div className="flex justify-end gap-4">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancelar
					</Button>
					<Button type="submit">Crear Factura</Button>
				</div>
			</form>
		</Form>
	);
}

