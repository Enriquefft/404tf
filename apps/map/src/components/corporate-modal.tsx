import { CorporateForm } from "@/components/corporate-form";
import { Modal } from "@/components/ui/modal";
import type { Locale } from "@/i18n/translations";

type ContextStartup = {
	slug: string;
	name: string;
	vertical: string;
};

type CorporateModalProps = {
	isOpen: boolean;
	onClose: () => void;
	locale: Locale;
	contextStartup?: ContextStartup | null;
};

export function CorporateModal({ isOpen, onClose, locale, contextStartup }: CorporateModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<CorporateForm locale={locale} contextStartup={contextStartup} onSuccess={onClose} />
		</Modal>
	);
}
