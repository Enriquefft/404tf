"use server";

import { z } from "zod";
import { db } from "@/db";
import { intentSubmissions } from "@/db/schema";

const intentSchema = z.object({
	intent: z.enum(["build", "collaborate", "connect"]),
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	locale: z.enum(["es", "en"]),
});

export type FormState = {
	success: boolean;
	message: string;
	errors?: {
		intent?: string[];
		name?: string[];
		email?: string[];
	};
} | null;

export async function submitIntent(_prevState: FormState, formData: FormData): Promise<FormState> {
	try {
		// Parse formData fields
		const rawData = {
			intent: formData.get("intent"),
			name: formData.get("name"),
			email: formData.get("email"),
			locale: formData.get("locale"),
		};

		// Validate with Zod
		const validation = intentSchema.safeParse(rawData);

		if (!validation.success) {
			const fieldErrors = validation.error.flatten().fieldErrors;
			return {
				success: false,
				message: "Validation failed",
				errors: {
					intent: fieldErrors.intent,
					name: fieldErrors.name,
					email: fieldErrors.email,
				},
			};
		}

		// Insert into database
		await db.insert(intentSubmissions).values(validation.data);

		return {
			success: true,
			message: "success",
		};
	} catch (error) {
		console.error("Database error in submitIntent:", error);
		return {
			success: false,
			message: "Database error. Please try again.",
		};
	}
}
