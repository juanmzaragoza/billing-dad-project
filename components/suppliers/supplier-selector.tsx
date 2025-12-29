"use client";

import { Search, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SupplierDocument } from "@/lib/types/supplier.types";
import type { SupplierSelectorProps } from "./supplier-selector.types";
import { useEntitySelector } from "@/lib/hooks/use-entity-selector";

export function SupplierSelector({
	value,
	onSelect,
	onInputChange,
	onCreateNew,
	className,
	placeholder = "Buscar proveedor...",
	hasEnoughDataToCreate,
}: SupplierSelectorProps) {
	const {
		searchQuery,
		entities: suppliers,
		isLoading,
		isOpen,
		setIsOpen,
		selectedEntity: selectedSupplier,
		containerRef,
		handleSelect,
		handleClear,
		handleInputChange,
	} = useEntitySelector<SupplierDocument>({
		value,
		fetchByIdEndpoint: (id) => `/api/suppliers/${id}`,
		searchEndpoint: (query) => `/api/suppliers?q=${encodeURIComponent(query)}`,
		onSelect,
		onInputChange,
	});

	return (
		<div ref={containerRef} className={cn("relative w-full", className)}>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					type="text"
					value={searchQuery}
					onChange={handleInputChange}
					onFocus={() => {
						if (searchQuery.length > 0 && suppliers.length > 0) {
							setIsOpen(true);
						}
					}}
					placeholder={placeholder}
					className="pl-10 pr-10 w-full"
				/>
				{selectedSupplier && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						×
					</button>
				)}
			</div>

			{isOpen && (
				<div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
					{isLoading ? (
						<div className="flex items-center justify-center p-4">
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						</div>
					) : suppliers.length > 0 ? (
						<div className="p-1">
							{suppliers.map((supplier) => (
								<button
									key={String(supplier._id)}
									type="button"
									onClick={() => handleSelect(supplier)}
									className="w-full text-left px-3 py-2 rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
								>
									<div className="font-medium">{supplier.name}</div>
									{supplier.taxId && (
										<div className="text-xs text-muted-foreground">
											CUIT: {supplier.taxId}
										</div>
									)}
								</button>
							))}
						</div>
					) : searchQuery.length > 0 ? (
						<div className="p-4 text-center text-sm text-muted-foreground">
							No se encontraron proveedores
							{onCreateNew &&
								(!hasEnoughDataToCreate || hasEnoughDataToCreate()) && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="mt-2 w-full"
										onClick={() => {
											setIsOpen(false);
											onCreateNew();
										}}
									>
										<UserPlus className="h-4 w-4 mr-2" />
										Crear nuevo proveedor
									</Button>
								)}
							{onCreateNew &&
								hasEnoughDataToCreate &&
								!hasEnoughDataToCreate() && (
									<p className="text-xs text-muted-foreground mt-2">
										Completa más datos del proveedor para crearlo
									</p>
								)}
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}


