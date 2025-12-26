"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportesPage() {
	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col gap-2">
				<h1 className="text-4xl font-bold tracking-tight">Reportes</h1>
				<p className="text-muted-foreground text-lg">
					Visualiza y analiza tus datos financieros
				</p>
			</div>

			{/* Content Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Análisis y Reportes
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-muted-foreground">
							No hay reportes disponibles aún
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							Los reportes se generarán automáticamente cuando tengas datos
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}






