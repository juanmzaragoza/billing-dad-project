"use client";

import { Search, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClientSelectorProps } from "@/lib/types/component.types";
import type { ClientDocument } from "@/lib/types/client.types";
import { useEntitySelector } from "@/lib/hooks/use-entity-selector";

export function ClientSelector({
	value,
	onSelect,
	onInputChange,
	onCreateNew,
	className,
	placeholder = "Buscar cliente...",
	hasEnoughDataToCreate,
}: ClientSelectorProps) {
	const {
		searchQuery,
		entities: clients,
		isLoading,
		isOpen,
		setIsOpen,
		selectedEntity: selectedClient,
		containerRef,
		handleSelect,
		handleClear,
		handleInputChange,
	} = useEntitySelector<ClientDocument>({
		value,
		fetchByIdEndpoint: (id) => `/api/clients/${id}`,
		searchEndpoint: (query) => `/api/clients?q=${encodeURIComponent(query)}`,
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
						if (searchQuery.length > 0 && clients.length > 0) {
							setIsOpen(true);
						}
					}}
					placeholder={placeholder}
					className="pl-10 pr-10 w-full"
				/>
				{selectedClient && (
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
					) : clients.length > 0 ? (
						<div className="p-1">
							{clients.map((client) => (
								<button
									key={String(client._id)}
									type="button"
									onClick={() => handleSelect(client)}
									className="w-full text-left px-3 py-2 rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
								>
									<div className="font-medium">{client.name}</div>
									{client.taxId && (
										<div className="text-xs text-muted-foreground">
											CUIT: {client.taxId}
										</div>
									)}
								</button>
							))}
						</div>
					) : searchQuery.length > 0 ? (
						<div className="p-4 text-center text-sm text-muted-foreground">
							No se encontraron clientes
							{onCreateNew && (!hasEnoughDataToCreate || hasEnoughDataToCreate()) && (
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
									Crear nuevo cliente
								</Button>
							)}
							{onCreateNew && hasEnoughDataToCreate && !hasEnoughDataToCreate() && (
								<p className="text-xs text-muted-foreground mt-2">
									Completa más datos del cliente para crearlo
								</p>
							)}
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}

