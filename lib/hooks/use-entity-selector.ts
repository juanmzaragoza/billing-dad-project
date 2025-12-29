import { useState, useEffect, useRef, useCallback } from "react";

export interface UseEntitySelectorOptions<T> {
	/**
	 * Initial entity ID to load
	 */
	value?: string;
	/**
	 * API endpoint for fetching a single entity by ID
	 */
	fetchByIdEndpoint: (id: string) => string;
	/**
	 * API endpoint for searching entities
	 */
	searchEndpoint: (query: string) => string;
	/**
	 * Debounce delay in milliseconds (default: 300)
	 */
	debounceDelay?: number;
	/**
	 * Callback when entity is selected
	 */
	onSelect?: (entity: T | null) => void;
	/**
	 * Callback when input changes
	 */
	onInputChange?: (value: string) => void;
}

export interface UseEntitySelectorReturn<T> {
	/**
	 * Current search query
	 */
	searchQuery: string;
	/**
	 * Set search query
	 */
	setSearchQuery: (query: string) => void;
	/**
	 * List of found entities
	 */
	entities: T[];
	/**
	 * Loading state
	 */
	isLoading: boolean;
	/**
	 * Whether dropdown is open
	 */
	isOpen: boolean;
	/**
	 * Set dropdown open state
	 */
	setIsOpen: (open: boolean) => void;
	/**
	 * Currently selected entity
	 */
	selectedEntity: T | null;
	/**
	 * Set selected entity
	 */
	setSelectedEntity: (entity: T | null) => void;
	/**
	 * Container ref for click outside detection
	 */
	containerRef: React.RefObject<HTMLDivElement | null>;
	/**
	 * Handle entity selection
	 */
	handleSelect: (entity: T) => void;
	/**
	 * Handle clear selection
	 */
	handleClear: () => void;
	/**
	 * Handle input change
	 */
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Generic hook for entity selector functionality
 * Handles search, selection, and dropdown state management
 */
export function useEntitySelector<T extends { _id?: unknown; name: string }>({
	value,
	fetchByIdEndpoint,
	searchEndpoint,
	debounceDelay = 300,
	onSelect,
	onInputChange,
}: UseEntitySelectorOptions<T>): UseEntitySelectorReturn<T> {
	const [searchQuery, setSearchQuery] = useState("");
	const [entities, setEntities] = useState<T[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [selectedEntity, setSelectedEntity] = useState<T | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	
	// Use refs to track the last processed value and avoid infinite loops
	const lastProcessedValueRef = useRef<string | undefined>(undefined);
	const isFetchingRef = useRef(false);

	// Fetch selected entity if value (entityId) is provided - this is only for initialization
	useEffect(() => {
		// Skip if value hasn't actually changed or if we're already fetching
		if (value === lastProcessedValueRef.current || isFetchingRef.current) {
			return;
		}

		if (value) {
			// Only fetch if we don't already have this entity selected
			const currentEntityId = selectedEntity?._id ? String(selectedEntity._id) : null;
			if (currentEntityId !== value) {
				lastProcessedValueRef.current = value;
				isFetchingRef.current = true;
				
				fetch(fetchByIdEndpoint(value))
					.then((res) => res.json())
					.then((entity) => {
						// Only update if the value hasn't changed while fetching
						if (entity._id && String(entity._id) === value && lastProcessedValueRef.current === value) {
							setSelectedEntity(entity);
							setSearchQuery(entity.name);
						}
					})
					.catch(() => {
						// Entity not found or error
						if (lastProcessedValueRef.current === value) {
							setSelectedEntity(null);
							setSearchQuery("");
						}
					})
					.finally(() => {
						isFetchingRef.current = false;
					});
			} else {
				// Value matches current selection, just update the ref
				lastProcessedValueRef.current = value;
			}
		} else if (!value && selectedEntity) {
			// Clear selection if value is removed
			lastProcessedValueRef.current = undefined;
			setSelectedEntity(null);
			// Don't clear searchQuery here - user might be typing
		} else {
			// No value and no selection, just update ref
			lastProcessedValueRef.current = undefined;
		}
		// Only depend on value, not on selectedEntity or fetchByIdEndpoint
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	// Search entities by name/taxId when query changes
	useEffect(() => {
		if (searchQuery.length === 0) {
			setEntities([]);
			setIsOpen(false);
			return;
		}

		// Don't search if the current query matches the selected entity's name
		// (to avoid unnecessary searches when initializing)
		if (selectedEntity && searchQuery === selectedEntity.name) {
			return;
		}

		const timeoutId = setTimeout(() => {
			setIsLoading(true);
			// Search by name or taxId
			fetch(searchEndpoint(searchQuery))
				.then((res) => res.json())
				.then((data) => {
					setEntities(data);
					setIsOpen(true);
				})
				.catch(() => {
					setEntities([]);
				})
				.finally(() => {
					setIsLoading(false);
				});
		}, debounceDelay); // Debounce

		return () => clearTimeout(timeoutId);
		// Only depend on searchQuery and selectedEntity, not on searchEndpoint
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, selectedEntity, debounceDelay]);

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

	const handleSelect = useCallback((entity: T) => {
		setSelectedEntity(entity);
		setSearchQuery(entity.name);
		setIsOpen(false);
		onSelect?.(entity);
	}, [onSelect]);

	const handleClear = useCallback(() => {
		setSelectedEntity(null);
		setSearchQuery("");
		setIsOpen(false);
		onSelect?.(null);
	}, [onSelect]);

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setSearchQuery(newValue);
		if (selectedEntity && newValue !== selectedEntity.name) {
			setSelectedEntity(null);
			onSelect?.(null);
		}
		// Notify parent of manual input (for form validation)
		if (onInputChange) {
			onInputChange(newValue);
		} else if (!selectedEntity) {
			onSelect?.(null);
		}
	}, [selectedEntity, onSelect, onInputChange]);

	return {
		searchQuery,
		setSearchQuery,
		entities,
		isLoading,
		isOpen,
		setIsOpen,
		selectedEntity,
		setSelectedEntity,
		containerRef,
		handleSelect,
		handleClear,
		handleInputChange,
	};
}

