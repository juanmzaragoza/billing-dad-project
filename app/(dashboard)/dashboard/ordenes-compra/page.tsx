"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus } from "lucide-react";

export default function OrdenesCompraPage() {
	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-4xl font-bold tracking-tight">Órdenes de Compra</h1>
					<p className="text-muted-foreground text-lg">
						Administra tus órdenes de compra y pedidos
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Nueva Orden
				</Button>
			</div>

			{/* Content Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ShoppingCart className="h-5 w-5" />
						Lista de Órdenes
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
						<p className="text-muted-foreground">
							No hay órdenes de compra registradas aún
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							Crea tu primera orden de compra para comenzar
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}






