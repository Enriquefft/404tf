"use server";

import { db } from "@404tf/database";
import { spechackParticipants } from "@404tf/database/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
	BUILDER_CLASSES,
	generateCardGradient,
	getRandomBuilderClass,
} from "@/lib/card-utils";

const registerSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email"),
	city: z.string().min(1, "City is required"),
	track: z.enum(["virtual", "hub"]),
	locale: z.enum(["es", "en"]),
});

export type RegisterFormState = {
	success: boolean;
	message: string;
	errors?: Record<string, string[]>;
	data?: {
		agentNumber: string;
		name: string;
		builderClass: string;
		builderClassDesc: { es: string; en: string };
		gradientData: string;
	};
} | null;

export async function submitRegistration(
	_prevState: RegisterFormState,
	formData: FormData,
): Promise<RegisterFormState> {
	try {
		const raw = Object.fromEntries(formData);
		const validation = registerSchema.safeParse(raw);

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

		const { name, email, city, track, locale } = validation.data;

		// Check duplicate email -- return existing card data
		const existing = await db.query.spechackParticipants.findFirst({
			where: eq(spechackParticipants.email, email),
		});

		if (existing) {
			const matchedClass = BUILDER_CLASSES.find(
				(bc) => bc.name === existing.builderClass,
			);
			return {
				success: true,
				message: "existing",
				data: {
					agentNumber: `SPEC-${existing.agentNumber.toString().padStart(4, "0")}`,
					name: existing.name,
					builderClass: existing.builderClass ?? "",
					builderClassDesc: matchedClass?.desc ?? { es: "", en: "" },
					gradientData: existing.gradientData ?? "{}",
				},
			};
		}

		// Generate card data
		const builderClass = getRandomBuilderClass();
		const gradient = generateCardGradient(name);
		const gradientData = JSON.stringify(gradient);

		// Insert -- do NOT pass agentNumber (serial auto-generates)
		const [participant] = await db
			.insert(spechackParticipants)
			.values({
				name,
				email,
				city,
				track,
				builderClass: builderClass.name,
				gradientData,
				locale,
			})
			.returning();

		return {
			success: true,
			message: "created",
			data: {
				agentNumber: `SPEC-${participant.agentNumber.toString().padStart(4, "0")}`,
				name: participant.name,
				builderClass: participant.builderClass ?? "",
				builderClassDesc: builderClass.desc,
				gradientData: participant.gradientData ?? "{}",
			},
		};
	} catch (error) {
		console.error("Registration error:", error);
		return { success: false, message: "server_error" };
	}
}
