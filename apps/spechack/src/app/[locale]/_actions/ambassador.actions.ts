"use server";

import { db } from "@404tf/database";
import { spechackAmbassadors } from "@404tf/database/schema";
import { z } from "zod";

const ambassadorSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email"),
	city: z.string().min(1, "City is required"),
	community: z.string().min(10, "Please describe your community"),
	locale: z.enum(["es", "en"]),
});

export type AmbassadorFormState = {
	success: boolean;
	message: string;
	errors?: Record<string, string[]>;
} | null;

export async function submitAmbassador(
	_prevState: AmbassadorFormState,
	formData: FormData,
): Promise<AmbassadorFormState> {
	try {
		const raw = Object.fromEntries(formData);
		const validation = ambassadorSchema.safeParse(raw);

		if (!validation.success) {
			return {
				success: false,
				message: "validation",
				errors: validation.error.flatten().fieldErrors as Record<
					string,
					string[]
				>,
			};
		}

		const { name, email, city, community, locale } = validation.data;

		await db.insert(spechackAmbassadors).values({
			name,
			email,
			city,
			community,
			locale,
		});

		return { success: true, message: "success" };
	} catch (error) {
		console.error("Ambassador submission error:", error);
		return { success: false, message: "error" };
	}
}
