"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	Settings,
	ChevronLeft,
	ChevronRight,
	ShoppingCart,
	BarChart3,
	Receipt,
	LayoutDashboard,
	Users,
	Building2,
	ChevronDown,
	ChevronUp,
	FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SidebarProps } from "@/lib/types/component.types";

const sidebarGroups = [
	{
		title: "Principal",
		items: [
			{
				title: "Dashboard",
				href: "/dashboard",
				icon: LayoutDashboard,
				badge: null,
			},
			{
				title: "Facturas",
				href: "/facturas",
				icon: Receipt,
				badge: null,
			},
		{
			title: "Órdenes de compra",
			href: "/ordenes-compra",
			icon: ShoppingCart,
			badge: null,
		},
		{
			title: "Reportes",
			href: "/reportes",
			icon: BarChart3,
			badge: null,
		},
		{
			title: "Catálogos",
			href: undefined, // No link, only expandable container
			icon: FolderTree,
			badge: null,
			subItems: [
				{
					title: "Clientes",
					href: "/clientes",
					icon: Users,
					badge: null,
				},
				{
					title: "Proveedores",
					href: "/proveedores",
					icon: Building2,
					badge: null,
				},
			],
		},
		{
			title: "Configuración",
			href: "/settings",
			icon: Settings,
			badge: null,
		},
		],
	},
];

export function Sidebar({ onMobileClose }: SidebarProps) {
	const pathname = usePathname();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

	// Auto-expand items with active sub-items
	useEffect(() => {
		const expanded = new Set<string>();
		sidebarGroups.forEach((group) => {
			group.items.forEach((item) => {
				if (item.subItems) {
					const hasActiveSubItem = item.subItems.some(subItem => pathname === subItem.href);
					if (hasActiveSubItem) {
						// Use href if exists, otherwise use title as key
						const key = item.href || item.title;
						expanded.add(key);
					}
				}
			});
		});
		setExpandedItems(expanded);
	}, [pathname]);

	const handleLinkClick = () => {
		if (onMobileClose) {
			onMobileClose();
		}
	};

	const toggleExpanded = (href: string) => {
		const newExpanded = new Set(expandedItems);
		if (newExpanded.has(href)) {
			newExpanded.delete(href);
		} else {
			newExpanded.add(href);
		}
		setExpandedItems(newExpanded);
	};

	return (
		<div
			className={cn(
				"flex h-full flex-col border-r bg-card shadow-sm transition-all duration-300",
				isCollapsed ? "w-16" : "w-72",
			)}
		>
			{/* Logo */}
			<div className="flex h-16 items-center border-b px-6 justify-between">
				{!isCollapsed && (
					<Link href="/dashboard" className="flex items-center gap-3 group">
						<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
							<Receipt className="w-4 h-4 text-primary-foreground" />
						</div>
						<span className="text-xl font-bold group-hover:text-primary transition-colors">
							Biling Dad
						</span>
					</Link>
				)}
				{isCollapsed && (
					<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
						<Receipt className="w-4 h-4 text-primary-foreground" />
					</div>
				)}
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 hover:bg-muted"
					onClick={() => setIsCollapsed(!isCollapsed)}
				>
					{isCollapsed ? (
						<ChevronRight className="h-4 w-4" />
					) : (
						<ChevronLeft className="h-4 w-4" />
					)}
				</Button>
			</div>

			{/* Navigation Groups */}
			<nav className="flex-1 space-y-8 p-6">
				{sidebarGroups.map((group) => (
					<div key={group.title} className="space-y-3">
						{/* Group Title */}
						{!isCollapsed && (
							<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-4">
								{group.title}
							</h3>
						)}

						{/* Group Items */}
						<div className="space-y-2">
							{group.items.map((item) => {
								const itemKey = item.href || item.title; // Use href as key, or title if no href
								const isActive = item.href ? pathname === item.href : false;
								const hasActiveSubItem = item.subItems && item.subItems.some(subItem => pathname === subItem.href);
								const Icon = item.icon;
								const hasSubItems = item.subItems && item.subItems.length > 0;
								const isExpanded = expandedItems.has(itemKey);

								return (
									<div key={itemKey} className="space-y-1">
										<div className="flex items-center">
											{item.href ? (
												<Link
													href={item.href}
													onClick={handleLinkClick}
													className={cn(
														"group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted flex-1",
														isActive && !hasSubItems
															? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
															: "text-muted-foreground hover:text-foreground",
														isCollapsed && "justify-center px-3 py-4",
													)}
													title={isCollapsed ? item.title : undefined}
												>
													<Icon
														className={cn(
															"transition-all duration-200",
															isCollapsed ? "h-5 w-5" : "h-4 w-4",
															isActive && !isCollapsed && !hasSubItems && "text-primary-foreground",
														)}
													/>
													{!isCollapsed && (
														<span className="group-hover:translate-x-0.5 transition-transform duration-200">
															{item.title}
														</span>
													)}
												</Link>
											) : (
												<button
													onClick={() => toggleExpanded(itemKey)}
													className={cn(
														"group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted flex-1 text-left w-full",
														hasActiveSubItem
															? "bg-muted text-foreground"
															: "text-muted-foreground hover:text-foreground",
														isCollapsed && "justify-center px-3 py-4",
													)}
													title={isCollapsed ? item.title : undefined}
												>
													<Icon
														className={cn(
															"transition-all duration-200",
															isCollapsed ? "h-5 w-5" : "h-4 w-4",
														)}
													/>
													{!isCollapsed && (
														<span className="group-hover:translate-x-0.5 transition-transform duration-200 flex-1">
															{item.title}
														</span>
													)}
													{!isCollapsed && hasSubItems && (
														isExpanded ? (
															<ChevronUp className="h-4 w-4" />
														) : (
															<ChevronDown className="h-4 w-4" />
														)
													)}
												</button>
											)}
											{hasSubItems && item.href && !isCollapsed && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={(e) => {
														e.preventDefault();
														toggleExpanded(itemKey);
													}}
												>
													{isExpanded ? (
														<ChevronUp className="h-4 w-4" />
													) : (
														<ChevronDown className="h-4 w-4" />
													)}
												</Button>
											)}
										</div>
										{hasSubItems && !isCollapsed && isExpanded && (
											<div className="ml-4 space-y-1 border-l-2 border-muted pl-4">
												{item.subItems.map((subItem) => {
													const isSubActive = pathname === subItem.href;
													const SubIcon = subItem.icon;

													return (
														<Link
															key={subItem.href}
															href={subItem.href}
															onClick={handleLinkClick}
															className={cn(
																"group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-muted",
																isSubActive
																	? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
																	: "text-muted-foreground hover:text-foreground",
															)}
														>
															<SubIcon
																className={cn(
																	"h-4 w-4 transition-all duration-200",
																	isSubActive && "text-primary-foreground",
																)}
															/>
															<span className="group-hover:translate-x-0.5 transition-transform duration-200">
																{subItem.title}
															</span>
														</Link>
													);
												})}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				))}
			</nav>
		</div>
	);
}
