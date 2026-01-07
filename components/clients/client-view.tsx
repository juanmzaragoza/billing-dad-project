"use client";

import { FormSection } from "@/components/forms";
import type { ClientDocument } from "@/lib/types/client.types";

/**
 * Props for ClientView component
 */
export interface ClientViewProps {
	client: ClientDocument;
}

/**
 * Component to display client details in read-only mode
 */
export function ClientView({ client }: ClientViewProps) {
	return (
		<div className="space-y-6">
			{/* Basic Information */}
			<FormSection title="Información Básica">
				<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">
							Nombre / Razón Social
						</p>
						<p className="text-sm">{client.name}</p>
					</div>
					{client.taxId && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">CUIT</p>
							<p className="text-sm font-mono">{client.taxId}</p>
						</div>
					)}
					{client.taxCondition && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Condición frente al IVA
							</p>
							<p className="text-sm">{client.taxCondition}</p>
						</div>
					)}
					{client.address && (
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">
								Dirección
							</p>
							<p className="text-sm">{client.address}</p>
						</div>
					)}
				</div>
			</FormSection>

			{/* Contact Information */}
			{(client.email || client.phone) && (
				<FormSection title="Información de Contacto">
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
						{client.email && (
							<div>
								<p className="text-sm font-medium text-muted-foreground mb-1">
									Email
								</p>
								<p className="text-sm">{client.email}</p>
							</div>
						)}
						{client.phone && (
							<div>
								<p className="text-sm font-medium text-muted-foreground mb-1">
									Teléfono
								</p>
								<p className="text-sm">{client.phone}</p>
							</div>
						)}
					</div>
				</FormSection>
			)}

			{/* Notes */}
			{client.notes && (
				<FormSection title="Notas Adicionales" showSeparator={false}>
					<div>
						<p className="text-sm whitespace-pre-wrap">{client.notes}</p>
					</div>
				</FormSection>
			)}
		</div>
	);
}


