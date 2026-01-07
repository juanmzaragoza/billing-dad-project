"use client";

import { FormSection } from "@/components/forms";
import type { SupplierDocument } from "@/lib/types/supplier.types";

/**
 * Props for SupplierView component
 */
export interface SupplierViewProps {
	supplier: SupplierDocument;
}

/**
 * Component to display supplier details in read-only mode
 */
export function SupplierView({ supplier }: SupplierViewProps) {
	return (
		<div className="space-y-6">
			{/* Basic Information */}
			<FormSection title="Información Básica">
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">
							Nombre / Razón Social
						</p>
						<p className="text-sm">{supplier.name}</p>
					</div>
					{supplier.taxId && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">CUIT</p>
							<p className="text-sm font-mono">{supplier.taxId}</p>
						</div>
					)}
					{supplier.taxCondition && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Condición frente al IVA
							</p>
							<p className="text-sm">{supplier.taxCondition}</p>
						</div>
					)}
					{supplier.address && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Dirección
							</p>
							<p className="text-sm">{supplier.address}</p>
						</div>
					)}
				</div>
			</FormSection>

			{/* Contact Information */}
			{(supplier.email || supplier.phone || supplier.contactPerson) && (
				<FormSection title="Información de Contacto">
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
						{supplier.email && (
							<div>
								<p className="text-sm font-medium text-muted-foreground mb-1">
									Email
								</p>
								<p className="text-sm">{supplier.email}</p>
							</div>
						)}
						{supplier.phone && (
							<div>
								<p className="text-sm font-medium text-muted-foreground mb-1">
									Teléfono
								</p>
								<p className="text-sm">{supplier.phone}</p>
							</div>
						)}
						{supplier.contactPerson && (
							<div>
								<p className="text-sm font-medium text-muted-foreground mb-1">
									Persona de Contacto
								</p>
								<p className="text-sm">{supplier.contactPerson}</p>
							</div>
						)}
					</div>
				</FormSection>
			)}

			{/* Notes */}
			{supplier.notes && (
				<FormSection title="Notas Adicionales" showSeparator={false}>
					<div>
						<p className="text-sm whitespace-pre-wrap">{supplier.notes}</p>
					</div>
				</FormSection>
			)}
		</div>
	);
}


