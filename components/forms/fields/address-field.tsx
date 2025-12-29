"use client";

import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { AddressFieldProps } from "./fields.types";

/**
 * Reusable field for address
 * Can be used in client, supplier, and invoice forms
 */
export function AddressField({
	field,
	className,
	placeholder = "Calle, número, ciudad",
	required = false,
	label = "Domicilio",
}: AddressFieldProps) {
	return (
		<FormItem className="min-h-[80px] flex flex-col">
			<FormLabel>
				{label} {!required && "(Opcional)"}
			</FormLabel>
			<FormControl>
				<Input
					{...field}
					placeholder={placeholder}
					className={className}
				/>
			</FormControl>
			<FormMessage className="text-xs mt-1 min-h-[16px]" />
		</FormItem>
	);
}


