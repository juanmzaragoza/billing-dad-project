"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import { SupplierSelector } from "@/components/suppliers/supplier-selector";
import type { SupplierDocument } from "@/lib/types/supplier.types";
// Import reusable components
import { FormSection, ItemsSection, InvoiceTotals } from "@/components/forms";
import { TaxIdField, TaxConditionField, AddressField } from "@/components/forms";
import { useItemsCalculations, useFiscalDataValidation, useEntityCreation } from "@/lib/hooks";
import {
	purchaseOrderSchema,
	type PurchaseOrderFormValues,
} from "@/lib/schemas/purchase-order.schemas";

export interface PurchaseOrderFormProps {
	onSubmit: (data: PurchaseOrderFormValues) => void;
	onCancel: () => void;
	defaultValues?: Partial<PurchaseOrderFormValues>;
}

export function PurchaseOrderForm({
	onSubmit,
	onCancel,
	defaultValues,
	isEditing = false,
}: PurchaseOrderFormProps & { isEditing?: boolean }) {
	const form = useForm<PurchaseOrderFormValues>({
		resolver: zodResolver(purchaseOrderSchema),
		defaultValues: {
			orderNumber: "",
			date: new Date().toISOString().split("T")[0],
			supplierId: undefined,
			supplierName: "",
			supplierTaxId: "",
			supplierTaxCondition: undefined,
			supplierAddress: "",
			items: [
				{
					description: "",
					quantity: 1,
					unitPrice: 0,
					taxRate: "21",
				},
			],
			paymentCondition: "Contado",
			deliveryDate: undefined,
			notes: "",
			status: "Pendiente",
			...defaultValues,
		},
		mode: "onChange",
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
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

	// Use hook for fiscal data validation
	const { hasEnoughDataToCreate } = useFiscalDataValidation({
		form,
		nameField: "supplierName",
		taxIdField: "supplierTaxId",
		taxConditionField: "supplierTaxCondition",
		requireFiscalData: true,
	});

	// Use hook for supplier creation
	const { createEntity: createSupplier } = useEntityCreation({
		form,
		nameField: "supplierName",
		idField: "supplierId",
		taxIdField: "supplierTaxId",
		taxConditionField: "supplierTaxCondition",
		addressField: "supplierAddress",
		createEndpoint: "/api/suppliers",
		getEntityData: (formValues) => ({
			name: formValues.supplierName,
			taxId: formValues.supplierTaxId,
			taxCondition: formValues.supplierTaxCondition,
			address: formValues.supplierAddress,
		}),
		updateFormFields: (form, newSupplier, formValues) => {
			form.setValue("supplierId", newSupplier._id as string);
			form.setValue("supplierName", formValues.supplierName || newSupplier.name);
			form.setValue("supplierTaxId", formValues.supplierTaxId || newSupplier.taxId || "");
			form.setValue("supplierTaxCondition", (formValues.supplierTaxCondition || newSupplier.taxCondition) as PurchaseOrderFormValues["supplierTaxCondition"]);
			form.setValue("supplierAddress", formValues.supplierAddress || newSupplier.address || "");
		},
		validationFields: ["supplierName", "supplierTaxId", "supplierTaxCondition", "supplierAddress"],
		nameRequiredMessage: "El nombre del proveedor es requerido",
		creationErrorMessage: "Error al crear el proveedor. Se creará automáticamente al guardar la orden.",
	});

	function handleSubmit(data: PurchaseOrderFormValues) {
		onSubmit(data);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				{/* Información de la orden */}
				<FormSection title="Información de la Orden">
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
						<FormField
							control={form.control}
							name="orderNumber"
							render={({ field }) => (
								<FormItem className="min-h-[80px] flex flex-col">
									<FormLabel>Número de Orden</FormLabel>
									<FormControl>
										<Input
											placeholder="OC-001"
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

						<FormField
							control={form.control}
							name="deliveryDate"
							render={({ field }) => (
								<FormItem className="min-h-[80px] flex flex-col">
									<FormLabel>Fecha de Entrega (Opcional)</FormLabel>
									<FormControl>
										<Input type="date" {...field} className="w-full" />
									</FormControl>
									<FormMessage className="text-xs mt-1 min-h-[16px]" />
								</FormItem>
							)}
						/>
					</div>
				</FormSection>

				{/* Datos del proveedor */}
				<FormSection title="Datos del Proveedor">
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="supplierName"
							render={() => (
								<FormItem className="min-h-[80px] flex flex-col">
									<FormLabel>Proveedor</FormLabel>
									<FormControl>
										<SupplierSelector
											value={form.watch("supplierId")}
											onSelect={(supplier: SupplierDocument | null) => {
												if (supplier) {
													form.setValue("supplierId", supplier._id as string);
													form.setValue("supplierName", supplier.name);
													form.setValue(
														"supplierTaxId",
														supplier.taxId || "",
													);
													form.setValue(
														"supplierTaxCondition",
														supplier.taxCondition || undefined,
													);
													form.setValue(
														"supplierAddress",
														supplier.address ?? "",
													);
													form.trigger([
														"supplierName",
														"supplierTaxId",
														"supplierTaxCondition",
														"supplierAddress",
													]);
												} else {
													form.setValue("supplierId", undefined);
												}
											}}
											onInputChange={(value: string) => {
												form.setValue("supplierName", value);
												form.setValue("supplierId", undefined);
											}}
											onCreateNew={createSupplier}
											hasEnoughDataToCreate={hasEnoughDataToCreate}
											placeholder="Buscar o escribir nombre del proveedor"
										/>
									</FormControl>
									<FormDescription className="text-xs mt-1">
										Busca por nombre o CUIT. Si escribes uno nuevo, se creará
										automáticamente al guardar la orden.
									</FormDescription>
									<FormMessage className="text-xs mt-1 min-h-[16px]" />
								</FormItem>
							)}
						/>

						{/* Use reusable fiscal fields */}
						<FormField
							control={form.control}
							name="supplierTaxId"
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
							name="supplierTaxCondition"
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
							name="supplierAddress"
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

				{/* Items - using reusable component */}
				<ItemsSection
					fields={fields}
					onAdd={() => append(defaultItem)}
					onRemove={remove}
					control={form.control}
					title="Productos/Servicios"
				/>

				{/* Totales */}
				<FormSection title="Totales" showSeparator={false}>
					<div className="grid gap-4 md:grid-cols-2">
						<FormField
							control={form.control}
							name="paymentCondition"
							render={({ field }) => (
								<FormItem className="min-h-[80px] flex flex-col">
									<FormLabel>Condición de Pago</FormLabel>
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

				{/* Notas */}
				<FormSection title="Notas Adicionales" showSeparator={false}>
					<FormField
						control={form.control}
						name="notes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Notas (Opcional)</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Notas adicionales sobre la orden..."
										{...field}
										rows={3}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</FormSection>

				{/* Botones */}
				<div className="flex justify-end gap-4">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancelar
					</Button>
					<Button type="submit">{isEditing ? "Guardar Cambios" : "Crear Orden"}</Button>
				</div>
			</form>
		</Form>
	);
}

