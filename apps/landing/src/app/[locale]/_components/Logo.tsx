import { cn } from "@/lib/utils";

type LogoProps = {
	className?: string;
};

export function Logo({ className }: LogoProps) {
	return (
		<a
			// biome-ignore lint/a11y/useValidAnchor: Anchor navigates to top of page via #
			href="#"
			aria-label="404 Tech Found - Scroll to top"
			className={cn("inline-flex flex-col items-center leading-none", className)}
		>
			<span className="font-orbitron font-extrabold text-[1.4em] text-foreground text-glow-purple">
				404
			</span>
			<span className="font-orbitron font-medium text-[0.55em] tracking-[0.2em] text-muted-foreground">
				TECH F<span className="line-through decoration-[0.12em]">O</span>
				UND
			</span>
		</a>
	);
}
