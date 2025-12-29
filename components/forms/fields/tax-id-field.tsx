"use client";

import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { TaxIdFieldProps } from "./fields.types";

/**
 * Reusable field for Tax ID (CUIT/CUIL/DNI) - Argentina
 * Can be used in client, supplier, and invoice forms
 */
export function TaxIdField({
	field,
	className,
	placeholder = "20123456789",
	maxLength = 11,
	required = false,
}: TaxIdFieldProps) {
	return (
		<FormItem className="min-h-[80px] flex flex-col">
			<FormLabel>
				CUIT/CUIL/DNI {!required && "(Opcional)"}
			</FormLabel>
			<FormControl>
				<Input
					{...field}
					placeholder={placeholder}
					maxLength={maxLength}
					className={className}
				/>
			</FormControl>
			<FormMessage className="text-xs mt-1 min-h-[16px]" />
		</FormItem>
	);
}


