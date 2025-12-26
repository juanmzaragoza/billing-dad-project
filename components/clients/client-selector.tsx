"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClientSelectorProps } from "@/lib/types/component.types";
import type { ClientDocument } from "@/lib/types/client.types";

export function ClientSelector({
	value,
	onSelect,
	onInputChange,
	onCreateNew,
	className,
	placeholder = "Buscar cliente...",
	hasEnoughDataToCreate,
}: ClientSelectorProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [clients, setClients] = useState<ClientDocument[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [selectedClient, setSelectedClient] = useState<ClientDocument | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Fetch selected client if value (clientId) is provided - this is only for initialization
	// The actual search is done by name/CUIT when user types
	useEffect(() => {
		if (value) {
			// Only fetch if we don't already have this client selected
			const currentClientId = selectedClient?._id ? String(selectedClient._id) : null;
			if (currentClientId !== value) {
				fetch(`/api/clients/${value}`)
					.then((res) => res.json())
					.then((client) => {
						if (client._id) {
							setSelectedClient(client);
							setSearchQuery(client.name);
						}
					})
					.catch(() => {
						// Client not found or error
						setSelectedClient(null);
						setSearchQuery("");
					});
			}
		} else if (!value && selectedClient) {
			// Clear selection if value is removed
			setSelectedClient(null);
			// Don't clear searchQuery here - user might be typing
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	// Search clients by name/CUIT when query changes (not by ID)
	// This is the actual search functionality - searches by name or taxId
	useEffect(() => {
		if (searchQuery.length === 0) {
			setClients([]);
			setIsOpen(false);
			return;
		}

		// Don't search if the current query matches the selected client's name
		// (to avoid unnecessary searches when initializing)
		if (selectedClient && searchQuery === selectedClient.name) {
			return;
		}

		const timeoutId = setTimeout(() => {
			setIsLoading(true);
			// Search by name or CUIT (not by ID)
			fetch(`/api/clients?q=${encodeURIComponent(searchQuery)}`)
				.then((res) => res.json())
				.then((data) => {
					setClients(data);
					setIsOpen(true);
				})
				.catch(() => {
					setClients([]);
				})
				.finally(() => {
					setIsLoading(false);
				});
		}, 300); // Debounce

		return () => clearTimeout(timeoutId);
	}, [searchQuery, selectedClient]);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	function handleClientSelect(client: ClientDocument) {
		setSelectedClient(client);
		setSearchQuery(client.name);
		setIsOpen(false);
		onSelect(client);
	}

	function handleClear() {
		setSelectedClient(null);
		setSearchQuery("");
		setIsOpen(false);
		onSelect(null);
	}

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const newValue = e.target.value;
		setSearchQuery(newValue);
		if (selectedClient && newValue !== selectedClient.name) {
			setSelectedClient(null);
			onSelect(null);
		}
		// Notify parent of manual input (for form validation)
		if (onInputChange) {
			onInputChange(newValue);
		} else if (!selectedClient) {
			onSelect(null);
		}
	}

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
									onClick={() => handleClientSelect(client)}
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

