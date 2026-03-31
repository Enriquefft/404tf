export const COUNTRY_FLAGS: Record<string, string> = {
	Peru: "\u{1F1F5}\u{1F1EA}",
	Argentina: "\u{1F1E6}\u{1F1F7}",
	Chile: "\u{1F1E8}\u{1F1F1}",
	Colombia: "\u{1F1E8}\u{1F1F4}",
	Mexico: "\u{1F1F2}\u{1F1FD}",
	Bolivia: "\u{1F1E7}\u{1F1F4}",
	Brazil: "\u{1F1E7}\u{1F1F7}",
	Uruguay: "\u{1F1FA}\u{1F1FE}",
	Ecuador: "\u{1F1EA}\u{1F1E8}",
	"Costa Rica": "\u{1F1E8}\u{1F1F7}",
	Paraguay: "\u{1F1F5}\u{1F1FE}",
};

export function getCountryFlag(country: string): string {
	return COUNTRY_FLAGS[country] ?? "";
}
