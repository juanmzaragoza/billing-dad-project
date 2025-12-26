"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
	InvoiceForm,
	type InvoiceFormValues,
} from "./invoice-form";
import type { InvoiceDocument } from "@/lib/types/invoice.types";
import * as invoiceActions from "./actions";
import { formatDate } from "@/lib/helpers/date.helper";
import {
	getInvoiceTypeLabel,
	getInvoiceNumber,
} from "@/lib/helpers/invoice.helper";

export default function FacturasPage() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [invoices, setInvoices] = useState<InvoiceDocument[]>([]);
	const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

	const fetchInvoices = async () => {
		try {
			const invoicesData = await invoiceActions.getAllInvoices();
			setInvoices(invoicesData);
		} catch (error) {
			console.error("Error fetching invoices:", error);
			toast.error("Error al cargar las facturas", {
				description:
					error instanceof Error ? error.message : "Ocurrió un error inesperado",
			});
		} finally {
			setIsLoadingInvoices(false);
		}
	};

	useEffect(() => {
		fetchInvoices();
	}, []);

	const handleSubmit = async (data: InvoiceFormValues) => {
		try {
			const createdInvoice = await invoiceActions.createInvoice(data);

			toast.success("Factura creada exitosamente", {
				description: `Para el cliente ${createdInvoice.clientName} por un total de $${createdInvoice.total.toFixed(2)}`,
				duration: 5000,
			});

			setIsDialogOpen(false);
			// Refrescar la lista de facturas
			await fetchInvoices();
		} catch (error) {
			console.error("Error creating invoice:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Ocurrió un error inesperado";

			toast.error("Error al crear la factura", {
				description: errorMessage,
				duration: 5000,
			});
		}
	};

	const handleDelete = async (invoice: InvoiceDocument) => {
		if (!confirm("¿Estás seguro de que deseas eliminar esta factura?")) {
			return;
		}

		const id = invoice._id?.toString();
		if (!id) {
			toast.error("Error", { description: "ID de factura inválido" });
			return;
		}

		try {
			await invoiceActions.deleteInvoice(id);
			toast.success("Factura eliminada exitosamente");
			await fetchInvoices();
		} catch (error) {
			console.error("Error deleting invoice:", error);
			toast.error("Error al eliminar la factura", {
				description:
					error instanceof Error ? error.message : "Ocurrió un error inesperado",
			});
		}
	};


	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-4xl font-bold tracking-tight">Facturas</h1>
					<p className="text-muted-foreground text-lg">
						Gestiona tus facturas y documentos fiscales
					</p>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Nueva Factura
						</Button>
					</DialogTrigger>
					<DialogContent className="!max-w-[90vw] lg:!max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw]">
						<DialogHeader>
							<DialogTitle>Nueva Factura</DialogTitle>
							<DialogDescription>
								Completa los datos para crear una nueva factura según normativa
								AFIP
							</DialogDescription>
						</DialogHeader>
						<InvoiceForm
							onSubmit={handleSubmit}
							onCancel={() => setIsDialogOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{/* Content Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Receipt className="h-5 w-5" />
						Lista de Facturas
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoadingInvoices ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<p className="text-muted-foreground">Cargando facturas...</p>
						</div>
					) : invoices.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Receipt className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-muted-foreground">
								No hay facturas registradas aún
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								Crea tu primera factura para comenzar
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Fecha</TableHead>
									<TableHead>Tipo</TableHead>
									<TableHead>Número</TableHead>
									<TableHead>Cliente</TableHead>
									<TableHead>Subtotal</TableHead>
									<TableHead>IVA</TableHead>
									<TableHead>Total</TableHead>
									<TableHead>Condición</TableHead>
									<TableHead className="text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoices.map((invoice) => (
									<TableRow key={invoice._id?.toString() || Math.random()}>
										<TableCell>{formatDate(invoice.date)}</TableCell>
										<TableCell>
											<Badge variant="outline">
												{getInvoiceTypeLabel(invoice.invoiceType)}
											</Badge>
										</TableCell>
										<TableCell className="font-mono">
											{getInvoiceNumber(invoice)}
										</TableCell>
										<TableCell>{invoice.clientName}</TableCell>
										<TableCell>${invoice.subtotal.toFixed(2)}</TableCell>
										<TableCell>${invoice.tax.toFixed(2)}</TableCell>
										<TableCell className="font-semibold">
											${invoice.total.toFixed(2)}
										</TableCell>
										<TableCell>{invoice.paymentCondition}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													title="Ver detalles"
												>
													<Eye className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-destructive hover:text-destructive"
													onClick={() => handleDelete(invoice)}
													title="Eliminar"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

