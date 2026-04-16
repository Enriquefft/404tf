export type Locale = "es" | "en";

type CorporateTranslations = {
	title: string;
	subtitle: string;
	step1Title: string;
	step2Title: string;
	stepOf: string;
	interestedIn: string;
	nameLabel: string;
	namePlaceholder: string;
	emailLabel: string;
	emailPlaceholder: string;
	companyLabel: string;
	companyPlaceholder: string;
	roleLabel: string;
	rolePlaceholder: string;
	industryLabel: string;
	industryPlaceholder: string;
	challengeLabel: string;
	challengePlaceholder: string;
	timelineLabel: string;
	timelinePlaceholder: string;
	notesLabel: string;
	notesPlaceholder: string;
	trustStep1: string;
	trustStep2: string;
	required: string;
	invalidEmail: string;
	fieldRequired: string;
	submitError: string;
	successTitle: string;
	successMessage: string;
	done: string;
	contactTitle: string;
	contactSubtitle: string;
	contactNextLabel: string;
	contactNextStep1Title: string;
	contactNextStep1Desc: string;
	contactNextStep2Title: string;
	contactNextStep2Desc: string;
	contactNextStep3Title: string;
	contactNextStep3Desc: string;
	contactResponsePromise: string;
	contactPrivacyNote: string;
	contactEmailHeading: string;
	contactEmailLead: string;
	contactEmailCta: string;
	contactOtherHeading: string;
	contactOtherLinkedinSoon: string;
	contactOtherTwitterSoon: string;
	roles: Record<string, string>;
	industries: Record<string, string>;
	timelines: Record<string, string>;
};

type SocialProofTestimonial = {
	quote: string;
	author: string;
	role: string;
};

type SocialProofTranslations = {
	liveCounterStartups: string;
	liveCounterCountries: string;
	liveCounterFundingMapped: string;
	backedByLabel: string;
	pressLabel: string;
	testimonialsLabel: string;
	testimonialsHeadline: string;
	testimonials: readonly [SocialProofTestimonial, SocialProofTestimonial, SocialProofTestimonial];
};

type LandingTranslations = {
	heroKicker: string;
	heroEyebrow: string;
	heroManifesto: string;
	heroSubtitle: string;
	heroSecondary: string;
	heroTrustLine: string;
	heroGetOnMapLink: string;
	mapTooltipCount: string;
	statsStartups: string;
	statsCountries: string;
	statsVerticals: string;
	scrollToExplore: string;
	featuredLabel: string;
	featuredKicker: string;
	featuredHeadline: string;
	featuredLink: string;
	dataLabel: string;
	dataHeadline: string;
	dataTopCountries: string;
	dataLink: string;
	dataBiotechOrAi: string;
	dataPilotStage: string;
	dataFromPeru: string;
	conversionLabel: string;
	conversionHeadline: string;
	corporateTitle: string;
	corporateDesc: string;
	corporateStep1: string;
	corporateStep2: string;
	corporateStep3: string;
	startupTitle: string;
	startupDesc: string;
	startupStep1: string;
	startupStep2: string;
	socialProof: SocialProofTranslations;
};

type StartupCardTranslations = {
	raised: string;
	tagReadyForPilot: string;
	tagEarlyStage: string;
	tagInStealth: string;
	tagRaising: string;
	tagNew: string;
	tagHiring: string;
};

type DirectoryTranslations = {
	searchPlaceholder: string;
	filterVerticals: string;
	filterCountry: string;
	filterCountryAll: string;
	filterMaturity: string;
	filterMaturityAll: string;
	clearAll: string;
	showingOf: string;
	sortLabel: string;
	sortAZ: string;
	sortNewest: string;
	emptyTitle: string;
	emptyMessage: string;
	showMap: string;
	hideMap: string;
	mapTooltipIn: string;
	heroKickerPrefix: string;
	heroKickerStartups: string;
	heroKickerCountries: string;
	heroHeadline: string;
	heroDescriptor: string;
	tabAll: string;
	tabPilotReady: string;
	tabRaising: string;
	tabNew: string;
	tabStealth: string;
	resultShowing: string;
	resultFilteredBy: string;
	resultNone: string;
	loadMore: string;
	floatingKicker: string;
	floatingLabel: string;
	mobileCtaKicker: string;
	emptyKicker: string;
	emptyHeadline: string;
	emptyContactCta: string;
	quickBookIntro: string;
	quickSave: string;
	quickSaved: string;
	quickShare: string;
	quickShared: string;
};

type ProfileTranslations = {
	breadcrumbDirectory: string;
	technology: string;
	keyResults: string;
	theProblem: string;
	businessModel: string;
	relatedStartups: string;
	moreIn: string;
	founded: string;
	teamSize: string;
	people: string;
	sidebarTitle: string;
	sidebarStep1: string;
	sidebarStep2: string;
	sidebarStep3: string;
	sidebarExplore: string;
	claimTitle: string;
	claimButton: string;
	incompleteProfile: string;
	visitWebsite: string;
	resultTypeProduct: string;
	resultTypeMetric: string;
	resultTypePartnership: string;
	resultTypeAward: string;
	resultTypePatent: string;
	resultTypePublication: string;
	claimNameLabel: string;
	claimNamePlaceholder: string;
	claimRoleLabel: string;
	claimRolePlaceholder: string;
	claimEmailLabel: string;
	claimEmailPlaceholder: string;
	claimProofLabel: string;
	claimProofPlaceholder: string;
	claimSubmit: string;
	claimSubmitting: string;
	claimSuccess: string;
	claimRequired: string;
	claimInvalidEmail: string;
	claimSubmitError: string;
};

type InsightsTranslations = {
	title: string;
	subtitle: string;
	byline: string;
	heroKicker: string;
	execStartups: string;
	execStartupsCompare: string;
	execCountries: string;
	execCountriesCompare: string;
	execFunding: string;
	execFundingCompare: string;
	geoTitle: string;
	geoLabel: string;
	geoKicker: string;
	geoInsight: string;
	verticalTitle: string;
	verticalLabel: string;
	verticalKicker: string;
	verticalInsight: string;
	verticalTopThree: string;
	foundingTitle: string;
	foundingLabel: string;
	foundingKicker: string;
	foundingInsight: string;
	foundingPeakAnnotation: string;
	maturityTitle: string;
	maturityLabel: string;
	maturityKicker: string;
	maturityInsight: string;
	fundingTitle: string;
	fundingLabel: string;
	fundingKicker: string;
	fundingInsight: string;
	fundingTotal: string;
	fundingWithData: string;
	fundingAvg: string;
	insightTag: string;
	sourceLine: string;
	pdfTitle: string;
	pdfSubtitle: string;
	pdfTrust: string;
	pdfNameLabel: string;
	pdfNamePlaceholder: string;
	pdfEmailLabel: string;
	pdfEmailPlaceholder: string;
	pdfSubmit: string;
	pdfSuccess: string;
	pdfPrivacy: string;
	pdfRequired: string;
	pdfInvalidEmail: string;
	pdfError: string;
	ctaTitle: string;
	startups: string;
};

type StartupsPageTranslations = {
	getOnMapTitle: string;
	getOnMapSubtitle: string;
	valuePropVisibility: string;
	valuePropVisibilityDesc: string;
	valuePropCredibility: string;
	valuePropCredibilityDesc: string;
	valuePropConnections: string;
	valuePropConnectionsDesc: string;
	qualifiesTitle: string;
	qualifiesDesc: string;
	applyStep1Title: string;
	applyStep2Title: string;
	applyStepOf: string;
	applyStartupName: string;
	applyStartupNamePlaceholder: string;
	applyWebsite: string;
	applyWebsitePlaceholder: string;
	applyYourName: string;
	applyYourNamePlaceholder: string;
	applyYourRole: string;
	applyYourRolePlaceholder: string;
	applyEmail: string;
	applyEmailPlaceholder: string;
	applyCountry: string;
	applyCountryPlaceholder: string;
	applyVertical: string;
	applyVerticalPlaceholder: string;
	applyMaturity: string;
	applyMaturityPlaceholder: string;
	applyOneLiner: string;
	applyOneLinerPlaceholder: string;
	applyWhy: string;
	applyWhyPlaceholder: string;
	applySuccess: string;
	programTitle: string;
	programSubtitle: string;
	tierAssess: string;
	tierAssessDesc: string;
	tierPrepare: string;
	tierPrepareDesc: string;
	tierConnect: string;
	tierConnectDesc: string;
	programStartupName: string;
	programYourName: string;
	programEmail: string;
	programTier: string;
	programTierPlaceholder: string;
	programDescription: string;
	programDescriptionPlaceholder: string;
	programSuccess: string;
	tierNotSure: string;
	footerNote: string;
	footerClaimLink: string;
	required: string;
	invalidEmail: string;
	fieldRequired: string;
	submitError: string;
};

type AboutTranslations = {
	aboutTitle: string;
	aboutP1: string;
	aboutP2: string;
	aboutP3: string;
	teamTitle: string;
	methodologyTitle: string;
	methodStep1Title: string;
	methodStep1Desc: string;
	methodStep2Title: string;
	methodStep2Desc: string;
	methodStep3Title: string;
	methodStep3Desc: string;
	methodStep4Title: string;
	methodStep4Desc: string;
	collaboratorsTitle: string;
	collaboratorPlaceholder: string;
	ctaTitle: string;
	ctaEmail: string;
};

type Translations = {
	meta: {
		siteTitle: string;
		tagline: string;
		directoryDesc: string;
		startupsDesc: string;
		aboutDesc: string;
	};
	nav: {
		directory: string;
		insights: string;
		startups: string;
		about: string;
		contact: string;
		openMenu: string;
		closeMenu: string;
	};
	footer: {
		description: string;
		byLine: string;
		navHeading: string;
		contactHeading: string;
		talkToUs: string;
		copyright: string;
		copyrightFull: string;
		methodology: string;
		legalHeading: string;
		legalTerms: string;
		legalPrivacy: string;
		legalCookies: string;
		address: string;
		responseTime: string;
		trustGdpr: string;
		trustDataHandling: string;
		trustBuiltIn: string;
		perfBuiltFast: string;
		perfRenderedIn: string;
		perfAnalytics: string;
	};
	common: {
		loading: string;
		close: string;
		back: string;
		next: string;
		submit: string;
		languageName: string;
		alternateLanguageName: string;
		ctaFindSolution: string;
		ctaGetOnMap: string;
		ctaTalk: string;
	};
	landing: LandingTranslations;
	directory: DirectoryTranslations;
	startupCard: StartupCardTranslations;
	corporate: CorporateTranslations;
	profile: ProfileTranslations;
	insights: InsightsTranslations;
	startupsPage: StartupsPageTranslations;
	about: AboutTranslations;
};

const en = {
	meta: {
		siteTitle: "404 Mapped",
		tagline: "Deeptech, finally in scope.",
		directoryDesc:
			"Browse 50+ deeptech startups across Latin America. Filter by vertical, country, and maturity stage.",
		startupsDesc:
			"Apply to join the 404 Mapped directory and get your deeptech startup in front of corporates and investors.",
		aboutDesc:
			"Learn about 404 Tech Found, our methodology, and the team behind the LATAM deeptech startup directory.",
	},
	nav: {
		directory: "Directory",
		insights: "Insights",
		startups: "For Startups",
		about: "About",
		contact: "Contact",
		openMenu: "Open menu",
		closeMenu: "Close menu",
	},
	footer: {
		description:
			"The LATAM deeptech startup directory. Discover, compare, and connect with the region's most ambitious builders.",
		byLine: "by 404 Tech Found",
		navHeading: "Navigate",
		contactHeading: "Contact",
		talkToUs: "Talk to us",
		copyright: "2026 404 Tech Found",
		copyrightFull: "© 2026 · Tech Found · All rights reserved",
		methodology: "About / Methodology",
		legalHeading: "Legal",
		legalTerms: "Terms of Service",
		legalPrivacy: "Privacy Policy",
		legalCookies: "Cookies Policy",
		address: "Tech Found · Lima, Perú",
		responseTime: "Replies within 24h · Mon–Fri",
		trustGdpr: "GDPR-ready",
		trustDataHandling: "Secure handling",
		trustBuiltIn: "Built in Perú",
		perfBuiltFast: "Built fast",
		perfRenderedIn: "Rendered in",
		perfAnalytics: "PostHog analytics · Privacy-first",
	},
	common: {
		loading: "Loading...",
		close: "Close",
		back: "Back",
		next: "Next",
		submit: "Submit",
		languageName: "English",
		alternateLanguageName: "Español",
		ctaFindSolution: "Find Your Deeptech Solution",
		ctaGetOnMap: "Get on the Map",
		ctaTalk: "Talk to 404tf",
	},
	landing: {
		heroKicker: "LATAM · DEEPTECH · INTELLIGENCE",
		heroEyebrow: "The LATAM deeptech directory",
		heroManifesto:
			"Latin America has been forging deeptech in silence. We dragged the forge into daylight and mapped every sparking anvil.",
		heroSubtitle: "Deeptech, finally in scope.",
		heroSecondary: "100+ startups building deep technology across Latin America",
		heroTrustLine: "For corporates · startups · investors",
		heroGetOnMapLink: "Building deeptech? Get on the map",
		mapTooltipCount: "startup",
		statsStartups: "Startups",
		statsCountries: "Countries",
		statsVerticals: "Verticals",
		scrollToExplore: "Scroll to explore",
		featuredLabel: "ON THE MAP",
		featuredKicker: "CURATED · APRIL 2026",
		featuredHeadline: "Six forges. Six stories. One map.",
		featuredLink: "Explore the full directory",
		dataLabel: "KEY FINDINGS",
		dataHeadline: "The landscape at a glance",
		dataTopCountries: "Top countries",
		dataLink: "See all insights",
		dataBiotechOrAi: "Biotech or AI/ML",
		dataPilotStage: "at Pilot stage",
		dataFromPeru: "startups from Peru",
		conversionLabel: "HOW 404 MAPPED WORKS",
		conversionHeadline: "Two paths, one ecosystem",
		corporateTitle: "Discover deeptech for your challenges",
		corporateDesc: "We match you with startups solving real problems in your industry.",
		corporateStep1: "Tell us your challenge",
		corporateStep2: "We curate the right matches",
		corporateStep3: "Connect and start collaborating",
		startupTitle: "Get in front of enterprise buyers",
		startupDesc:
			"Join the directory and get discovered by corporates looking for deeptech solutions.",
		startupStep1: "Submit your startup profile",
		startupStep2: "Get discovered by corporates",
		socialProof: {
			liveCounterStartups: "Startups",
			liveCounterCountries: "Countries",
			liveCounterFundingMapped: "Funding mapped",
			backedByLabel: "Working with",
			pressLabel: "Press & research",
			testimonialsLabel: "WHAT THEY SAY",
			testimonialsHeadline: "Voices from the LATAM deeptech ecosystem",
			testimonials: [
				{
					quote:
						"404 Mapped gives our innovation team a defensible shortlist in days, not quarters. The rigor behind the directory is what sold us.",
					author: "Placeholder Name",
					role: "Head of Innovation, Corporate Partner (TBD)",
				},
				{
					quote:
						"Being on the map put us in the room with two Fortune 500 procurement teams in the first month. Corporate scouts actually use this.",
					author: "Placeholder Founder",
					role: "CEO, Featured Startup (TBD)",
				},
				{
					quote:
						"The deeptech signal in Latin America has been scattered for years. 404 Mapped is the first honest index we've worked with.",
					author: "Placeholder Investor",
					role: "Partner, LATAM VC Fund (TBD)",
				},
			],
		},
	},
	startupCard: {
		raised: "raised",
		tagReadyForPilot: "READY FOR PILOT",
		tagEarlyStage: "EARLY STAGE",
		tagInStealth: "IN STEALTH",
		tagRaising: "RAISING",
		tagNew: "NEW",
		tagHiring: "HIRING",
	},
	directory: {
		searchPlaceholder: "Search startups...",
		filterVerticals: "Verticals",
		filterCountry: "Country",
		filterCountryAll: "All countries",
		filterMaturity: "Maturity",
		filterMaturityAll: "All stages",
		clearAll: "Clear all",
		showingOf: "Showing {count} of {total}",
		sortLabel: "Sort by",
		sortAZ: "A-Z",
		sortNewest: "Newest",
		emptyTitle: "No startups match your filters",
		emptyMessage: "Try adjusting your search or clearing some filters.",
		showMap: "View map",
		hideMap: "Hide map",
		mapTooltipIn: "in",
		heroKickerPrefix: "DIRECTORY",
		heroKickerStartups: "STARTUPS",
		heroKickerCountries: "COUNTRIES",
		heroHeadline: "Find the startup moving your industry.",
		heroDescriptor:
			"Curated deeptech builders across Latin America. Filter by stage, vertical, and country to find your next pilot partner.",
		tabAll: "All",
		tabPilotReady: "Ready for pilot",
		tabRaising: "Raising",
		tabNew: "New",
		tabStealth: "In stealth",
		resultShowing: "{count} of {total} startups",
		resultFilteredBy: "Filtered by",
		resultNone: "No filters active",
		loadMore: "Load more",
		floatingKicker: "FOR CORPORATES · FREE",
		floatingLabel: "Find your deeptech solution",
		mobileCtaKicker: "FOR CORPORATES",
		emptyKicker: "NO RESULTS",
		emptyHeadline:
			"Refine your search or reach out — we may already know a startup that isn't on the map yet.",
		emptyContactCta: "Contact us",
		quickBookIntro: "Book intro",
		quickSave: "Save",
		quickSaved: "Saved",
		quickShare: "Share",
		quickShared: "Copied",
	},
	corporate: {
		title: "Find Your Deeptech Solution",
		subtitle: "Tell us about your challenge and we'll match you with the right startups.",
		step1Title: "Tell us about you",
		step2Title: "What are you looking for?",
		stepOf: "Step {current} of {total}",
		interestedIn: "Interested in:",
		nameLabel: "Name",
		namePlaceholder: "Your full name",
		emailLabel: "Email",
		emailPlaceholder: "you@company.com",
		companyLabel: "Company",
		companyPlaceholder: "Your company name",
		roleLabel: "Role",
		rolePlaceholder: "Select your role",
		industryLabel: "Industry",
		industryPlaceholder: "Select your industry",
		challengeLabel: "Your challenge",
		challengePlaceholder:
			"e.g., We need to reduce water usage in our mining operations by 30% within 18 months",
		timelineLabel: "Timeline",
		timelinePlaceholder: "Select a timeline",
		notesLabel: "Additional notes",
		notesPlaceholder: "Anything else we should know?",
		trustStep1: "No commitment required",
		trustStep2: "We respond within 2 business days",
		required: "Required",
		invalidEmail: "Please enter a valid email address",
		fieldRequired: "This field is required",
		submitError: "Something went wrong. Please try again.",
		successTitle: "We got your request",
		successMessage:
			"Our team will review and get back within 2 business days with relevant deeptech matches.",
		done: "Done",
		contactTitle: "Get in Touch",
		contactSubtitle: "Tell us about your deeptech needs and we'll find the right solutions.",
		contactNextLabel: "What happens next",
		contactNextStep1Title: "We read every word",
		contactNextStep1Desc:
			"Your message lands directly with the 404 Tech Found partners — no bot, no triage queue.",
		contactNextStep2Title: "You hear back within 24h",
		contactNextStep2Desc:
			"A founder replies with a first read, clarifying questions, or a short list of deeptech startups worth a call.",
		contactNextStep3Title: "We book a 30-minute call",
		contactNextStep3Desc:
			"If there's a fit, we align on scope, introduce the relevant builders, and map a pilot path.",
		contactResponsePromise: "Replies within 24h, Mon–Fri",
		contactPrivacyNote:
			"Only the 404tf partners see this. Never shared, never sold — GDPR-ready handling.",
		contactEmailHeading: "Prefer email?",
		contactEmailLead: "Skip the form. Write directly and we'll pick it up the same way.",
		contactEmailCta: "Write to hello@404tf.com",
		contactOtherHeading: "Other ways to reach us",
		contactOtherLinkedinSoon: "LinkedIn — coming soon",
		contactOtherTwitterSoon: "X / Twitter — coming soon",
		roles: {
			innovation_director: "Innovation Director",
			cto: "CTO / VP Engineering",
			procurement: "Procurement",
			strategy: "Strategy",
			government: "Government Official",
			vc: "VC / Investor",
			other: "Other",
		},
		industries: {
			mining: "Mining",
			energy: "Energy",
			agriculture: "Agriculture",
			manufacturing: "Manufacturing",
			financial: "Financial Services",
			healthcare: "Healthcare",
			logistics: "Logistics",
			retail: "Retail",
			telecom: "Telecommunications",
			government: "Government / Public Sector",
			other: "Other",
		},
		timelines: {
			exploring: "Just exploring",
			"1_3": "1-3 months",
			"3_6": "3-6 months",
			"6_12": "6-12 months",
		},
	},
	profile: {
		breadcrumbDirectory: "Directory",
		technology: "Technology",
		keyResults: "Key Results",
		theProblem: "The Problem",
		businessModel: "Business Model",
		relatedStartups: "Related Startups",
		moreIn: "More in",
		founded: "Founded",
		teamSize: "Team",
		people: "people",
		sidebarTitle: "Need a solution like this?",
		sidebarStep1: "Understand your challenge",
		sidebarStep2: "Analyze matching startups",
		sidebarStep3: "Facilitate a pilot",
		sidebarExplore: "Or explore similar startups below",
		claimTitle: "Are you part of {name}?",
		claimButton: "Claim this profile",
		incompleteProfile: "This profile is being completed by the startup team.",
		visitWebsite: "Visit website",
		resultTypeProduct: "Product",
		resultTypeMetric: "Metric",
		resultTypePartnership: "Partnership",
		resultTypeAward: "Award",
		resultTypePatent: "Patent",
		resultTypePublication: "Publication",
		claimNameLabel: "Your name",
		claimNamePlaceholder: "Your full name",
		claimRoleLabel: "Your role",
		claimRolePlaceholder: "e.g., CEO, CTO, Co-Founder",
		claimEmailLabel: "Email",
		claimEmailPlaceholder: "you@startup.com",
		claimProofLabel: "Proof of association",
		claimProofPlaceholder:
			"e.g., share your company email domain, LinkedIn profile, or other verification",
		claimSubmit: "Submit claim",
		claimSubmitting: "Submitting...",
		claimSuccess: "Claim request received. Our team will review within 5 business days.",
		claimRequired: "Required",
		claimInvalidEmail: "Please enter a valid email address",
		claimSubmitError: "Something went wrong. Please try again.",
	},
	insights: {
		title: "The State of Deeptech",
		subtitle:
			"Where Latin America is quietly forging its hardest technology — by country, vertical, vintage, and stage. First edition, 2026.",
		byline: "A 404 Mapped report",
		heroKicker: "STATE · 2026 · MARCH",
		execStartups: "Startups Mapped",
		execStartupsCompare: "First edition, 2026",
		execCountries: "Countries",
		execCountriesCompare: "Across LATAM",
		execFunding: "Total Funding Disclosed",
		execFundingCompare: "From {pct}% of startups with data",
		geoTitle: "Where is deeptech?",
		geoLabel: "GEOGRAPHIC DISTRIBUTION",
		geoKicker: "WHERE DEEPTECH LIVES",
		geoInsight:
			"{leader} dominates with {leaderCount} startups — {multiple}× {second}. The map is concentrated, not spread.",
		verticalTitle: "What are they building?",
		verticalLabel: "VERTICAL BREAKDOWN",
		verticalKicker: "WHAT THEY'RE BUILDING",
		verticalInsight:
			"{leader} leads with {count} startups. The top three verticals capture {share}% of all tags.",
		verticalTopThree: "TOP 3",
		foundingTitle: "When did they start?",
		foundingLabel: "FOUNDING TIMELINE",
		foundingKicker: "WHEN THEY STARTED",
		foundingInsight:
			"{year} was the peak year — {count} new startups. {pct}% of the cohort was founded in the last five years.",
		foundingPeakAnnotation: "PEAK · {year}",
		maturityTitle: "How mature are they?",
		maturityLabel: "MATURITY DISTRIBUTION",
		maturityKicker: "HOW MATURE",
		maturityInsight:
			"{earlyPct}% still in R&D or prototype. The commercial frontier is thin — only {commercialPct}% at pilot or revenue.",
		fundingTitle: "Follow the money",
		fundingLabel: "FUNDING LANDSCAPE",
		fundingKicker: "FOLLOW THE MONEY",
		fundingInsight:
			"{total} raised across {count} startups — the top three capture {share}% of disclosed capital.",
		fundingTotal: "Total Disclosed",
		fundingWithData: "With Funding Data",
		fundingAvg: "Avg. Funded Round",
		insightTag: "INSIGHT",
		sourceLine: "Source: 404 Mapped database · April 2026",
		pdfTitle: "Download the Full Report",
		pdfSubtitle: "First edition, 2026",
		pdfTrust: "Free PDF with extended analysis and methodology.",
		pdfNameLabel: "Name",
		pdfNamePlaceholder: "Your name",
		pdfEmailLabel: "Email",
		pdfEmailPlaceholder: "you@company.com",
		pdfSubmit: "Download Report",
		pdfSuccess: "We will send the report to your email when it is ready.",
		pdfPrivacy: "We respect your privacy. No spam, ever.",
		pdfRequired: "Required",
		pdfInvalidEmail: "Please enter a valid email",
		pdfError: "Something went wrong. Please try again.",
		ctaTitle: "Looking for a deeptech solution?",
		startups: "startups",
	},
	startupsPage: {
		getOnMapTitle: "Get your startup in front of corporates, investors, and the ecosystem",
		getOnMapSubtitle: "Apply to join the 404 Mapped directory",
		valuePropVisibility: "Visibility",
		valuePropVisibilityDesc:
			"Your profile is seen by corporates, VCs, and ecosystem leaders across LATAM.",
		valuePropCredibility: "Credibility",
		valuePropCredibilityDesc:
			"Being selected for the directory signals deeptech rigor and traction.",
		valuePropConnections: "Connections",
		valuePropConnectionsDesc:
			"404tf facilitates introductions to enterprises looking for deeptech solutions.",
		qualifiesTitle: "Who qualifies?",
		qualifiesDesc:
			"We accept startups building deep technology: proprietary science, novel engineering, or hard-to-replicate technical moats. Software-only or pure digital service companies do not qualify. You must be based in or primarily operating in Latin America.",
		applyStep1Title: "Your details",
		applyStep2Title: "About your startup",
		applyStepOf: "Step {current} of {total}",
		applyStartupName: "Startup name",
		applyStartupNamePlaceholder: "Your startup's name",
		applyWebsite: "Website",
		applyWebsitePlaceholder: "https://yourstartup.com",
		applyYourName: "Your name",
		applyYourNamePlaceholder: "Your full name",
		applyYourRole: "Your role",
		applyYourRolePlaceholder: "e.g., CEO, CTO, Founder",
		applyEmail: "Email",
		applyEmailPlaceholder: "you@startup.com",
		applyCountry: "Country",
		applyCountryPlaceholder: "Select country",
		applyVertical: "Primary vertical",
		applyVerticalPlaceholder: "Select vertical",
		applyMaturity: "Maturity level",
		applyMaturityPlaceholder: "Select maturity",
		applyOneLiner: "One-liner",
		applyOneLinerPlaceholder: "Describe what your startup does in one sentence",
		applyWhy: "Why should we feature you?",
		applyWhyPlaceholder: "What makes your technology unique and why should corporates care?",
		applySuccess: "Application received. We review within 5 business days.",
		programTitle: "Ready to sell to corporates?",
		programSubtitle: "We help deeptech startups close their first enterprise deals.",
		tierAssess: "Assess",
		tierAssessDesc: "Sales readiness diagnostic, positioning review, competitive brief.",
		tierPrepare: "Prepare",
		tierPrepareDesc:
			"Pitch deck restructuring, value prop development, pricing guidance, mock proposal.",
		tierConnect: "Connect",
		tierConnectDesc: "Curated corporate intros, meeting facilitation, pilot scoping, deal support.",
		programStartupName: "Startup name",
		programYourName: "Your name",
		programEmail: "Email",
		programTier: "Which tier interests you?",
		programTierPlaceholder: "Select a tier",
		programDescription: "Tell us about your startup",
		programDescriptionPlaceholder:
			"What do you build, where are you in your sales journey, and what kind of support would help most?",
		programSuccess: "Inquiry received. We will be in touch within 3 business days.",
		tierNotSure: "Not sure yet",
		footerNote: "Already featured?",
		footerClaimLink: "Claim your profile to manage your page.",
		required: "Required",
		invalidEmail: "Please enter a valid email address",
		fieldRequired: "This field is required",
		submitError: "Something went wrong. Please try again.",
	},
	about: {
		aboutTitle: "About 404 Tech Found",
		aboutP1:
			"404 Tech Found is a deeptech ecosystem builder based in Lima, Peru. We exist because Latin America has world-class scientific talent, but the infrastructure to connect it with industry is broken.",
		aboutP2:
			"We map, validate, and connect deeptech startups with corporates, governments, and investors who need next-generation solutions. Our work sits at the intersection of open innovation consulting, ecosystem intelligence, and startup enablement.",
		aboutP3:
			"404 Mapped is our flagship platform: a curated directory of 50+ deeptech startups across Latin America, designed to make the region's most ambitious builders visible and accessible.",
		teamTitle: "The Team",
		methodologyTitle: "Methodology",
		methodStep1Title: "Sourced 400+",
		methodStep1Desc:
			"We sourced over 400 startups from accelerators, university programs, investor portfolios, and ecosystem partners across LATAM.",
		methodStep2Title: "Applied deeptech criteria",
		methodStep2Desc:
			"Each startup was evaluated on proprietary technology, scientific novelty, and technical moat depth. Software-only and pure service companies were excluded.",
		methodStep3Title: "Validated traction",
		methodStep3Desc:
			"We verified claims against public data, partner references, and direct conversations. Key results and partnerships were fact-checked.",
		methodStep4Title: "Selected 50+",
		methodStep4Desc:
			"The final selection represents the most credible, traction-validated deeptech startups in the region. The directory grows as new startups apply and are reviewed.",
		collaboratorsTitle: "Collaborators",
		collaboratorPlaceholder: "Partner",
		ctaTitle: "Questions?",
		ctaEmail: "hello@404tf.com",
	},
} as const satisfies Translations;

const es = {
	meta: {
		siteTitle: "404 Mapped",
		tagline: "Deeptech, por fin a la vista.",
		directoryDesc:
			"Explora 50+ startups deeptech en América Latina. Filtra por vertical, país y etapa de madurez.",
		startupsDesc:
			"Aplica para unirte al directorio de 404 Mapped y pon tu startup deeptech frente a corporativos e inversionistas.",
		aboutDesc:
			"Conoce a 404 Tech Found, nuestra metodología y el equipo detrás del directorio de startups deeptech de LATAM.",
	},
	nav: {
		directory: "Directorio",
		insights: "Perspectivas",
		startups: "Para Startups",
		about: "Nosotros",
		contact: "Contacto",
		openMenu: "Abrir menú",
		closeMenu: "Cerrar menú",
	},
	footer: {
		description:
			"El directorio de startups deeptech de LATAM. Descubre, compara y conecta con los constructores más ambiciosos de la región.",
		byLine: "por 404 Tech Found",
		navHeading: "Navegar",
		contactHeading: "Contacto",
		talkToUs: "Hablemos",
		copyright: "2026 404 Tech Found",
		copyrightFull: "© 2026 · Tech Found · Todos los derechos reservados",
		methodology: "Nosotros / Metodología",
		legalHeading: "Legal",
		legalTerms: "Términos de Servicio",
		legalPrivacy: "Política de Privacidad",
		legalCookies: "Política de Cookies",
		address: "Tech Found · Lima, Perú",
		responseTime: "Respondemos en 24h · lun–vie",
		trustGdpr: "GDPR-ready",
		trustDataHandling: "Manejo seguro",
		trustBuiltIn: "Hecho en Perú",
		perfBuiltFast: "Construido rápido",
		perfRenderedIn: "Renderizado en",
		perfAnalytics: "PostHog analytics · Privacidad primero",
	},
	common: {
		loading: "Cargando...",
		close: "Cerrar",
		back: "Atrás",
		next: "Siguiente",
		submit: "Enviar",
		languageName: "Español",
		alternateLanguageName: "English",
		ctaFindSolution: "Encuentra tu solución deeptech",
		ctaGetOnMap: "Aparece en el mapa",
		ctaTalk: "Habla con 404tf",
	},
	landing: {
		heroKicker: "LATAM · DEEPTECH · INTELIGENCIA",
		heroEyebrow: "El directorio deeptech de LATAM",
		heroManifesto:
			"América Latina llevaba años forjando deeptech en silencio. Sacamos la forja a la luz y mapeamos cada yunque que echaba chispas.",
		heroSubtitle: "Deeptech, por fin a la vista.",
		heroSecondary: "100+ startups construyendo tecnología profunda en América Latina",
		heroTrustLine: "Para corporativos · startups · inversionistas",
		heroGetOnMapLink: "¿Construyes deeptech? Aparece en el mapa",
		mapTooltipCount: "startup",
		statsStartups: "Startups",
		statsCountries: "Países",
		statsVerticals: "Verticales",
		scrollToExplore: "Desplázate para explorar",
		featuredLabel: "EN EL MAPA",
		featuredKicker: "CURADO · ABRIL 2026",
		featuredHeadline: "Seis forjas. Seis historias. Un mapa.",
		featuredLink: "Explora el directorio completo",
		dataLabel: "HALLAZGOS CLAVE",
		dataHeadline: "El panorama de un vistazo",
		dataTopCountries: "Principales países",
		dataLink: "Ver todas las perspectivas",
		dataBiotechOrAi: "Biotech o IA/ML",
		dataPilotStage: "en etapa Piloto",
		dataFromPeru: "startups de Perú",
		conversionLabel: "CÓMO FUNCIONA 404 MAPPED",
		conversionHeadline: "Dos caminos, un ecosistema",
		corporateTitle: "Descubre deeptech para tus desafíos",
		corporateDesc: "Te conectamos con startups que resuelven problemas reales en tu industria.",
		corporateStep1: "Cuéntanos tu desafío",
		corporateStep2: "Curamos las mejores opciones",
		corporateStep3: "Conecta y empieza a colaborar",
		startupTitle: "Llega a compradores corporativos",
		startupDesc:
			"Únete al directorio y sé descubierto por corporativos que buscan soluciones deeptech.",
		startupStep1: "Envía el perfil de tu startup",
		startupStep2: "Sé descubierto por corporativos",
		socialProof: {
			liveCounterStartups: "Startups",
			liveCounterCountries: "Países",
			liveCounterFundingMapped: "Financiamiento mapeado",
			backedByLabel: "Trabajando con",
			pressLabel: "Prensa e investigación",
			testimonialsLabel: "LO QUE DICEN",
			testimonialsHeadline: "Voces del ecosistema deeptech LATAM",
			testimonials: [
				{
					quote:
						"404 Mapped nos entrega una lista corta defendible en días, no en trimestres. El rigor detrás del directorio fue lo que nos convenció.",
					author: "Nombre Pendiente",
					role: "Directora de Innovación, Socio Corporativo (por confirmar)",
				},
				{
					quote:
						"Estar en el mapa nos puso en reuniones con dos equipos de compras de Fortune 500 en el primer mes. Los exploradores corporativos realmente lo usan.",
					author: "Fundador Pendiente",
					role: "CEO, Startup Destacada (por confirmar)",
				},
				{
					quote:
						"La señal deeptech en América Latina estuvo dispersa por años. 404 Mapped es el primer índice honesto con el que hemos trabajado.",
					author: "Inversionista Pendiente",
					role: "Partner, Fondo VC LATAM (por confirmar)",
				},
			],
		},
	},
	startupCard: {
		raised: "levantado",
		tagReadyForPilot: "LISTA PARA PILOTO",
		tagEarlyStage: "ETAPA TEMPRANA",
		tagInStealth: "EN STEALTH",
		tagRaising: "LEVANTANDO",
		tagNew: "NUEVA",
		tagHiring: "CONTRATANDO",
	},
	directory: {
		searchPlaceholder: "Buscar startups...",
		filterVerticals: "Verticales",
		filterCountry: "País",
		filterCountryAll: "Todos los países",
		filterMaturity: "Madurez",
		filterMaturityAll: "Todas las etapas",
		clearAll: "Limpiar todo",
		showingOf: "Mostrando {count} de {total}",
		sortLabel: "Ordenar por",
		sortAZ: "A-Z",
		sortNewest: "Más recientes",
		emptyTitle: "Ninguna startup coincide con tus filtros",
		emptyMessage: "Intenta ajustar tu búsqueda o eliminar algunos filtros.",
		showMap: "Ver mapa",
		hideMap: "Ocultar mapa",
		mapTooltipIn: "en",
		heroKickerPrefix: "DIRECTORIO",
		heroKickerStartups: "STARTUPS",
		heroKickerCountries: "PAÍSES",
		heroHeadline: "Encuentra la startup que mueve tu industria.",
		heroDescriptor:
			"Builders deeptech curados en América Latina. Filtra por etapa, vertical y país para encontrar tu próximo socio de piloto.",
		tabAll: "Todos",
		tabPilotReady: "Listas para piloto",
		tabRaising: "Recaudando",
		tabNew: "Nuevas",
		tabStealth: "En sigilo",
		resultShowing: "{count} de {total} startups",
		resultFilteredBy: "Filtrado por",
		resultNone: "Sin filtros activos",
		loadMore: "Cargar más",
		floatingKicker: "PARA CORPORATIVOS · GRATUITO",
		floatingLabel: "Encuentra tu solución deeptech",
		mobileCtaKicker: "PARA CORPORATIVOS",
		emptyKicker: "SIN RESULTADOS",
		emptyHeadline:
			"Afina tu búsqueda o contáctanos — quizás tenemos una startup que aún no está en el mapa.",
		emptyContactCta: "Contáctanos",
		quickBookIntro: "Agendar intro",
		quickSave: "Guardar",
		quickSaved: "Guardado",
		quickShare: "Compartir",
		quickShared: "Copiado",
	},
	corporate: {
		title: "Encuentra tu solución deeptech",
		subtitle: "Cuéntanos tu desafío y te conectaremos con las startups indicadas.",
		step1Title: "Cuéntanos sobre ti",
		step2Title: "¿Qué estás buscando?",
		stepOf: "Paso {current} de {total}",
		interestedIn: "Interesado en:",
		nameLabel: "Nombre",
		namePlaceholder: "Tu nombre completo",
		emailLabel: "Correo electrónico",
		emailPlaceholder: "tu@empresa.com",
		companyLabel: "Empresa",
		companyPlaceholder: "Nombre de tu empresa",
		roleLabel: "Rol",
		rolePlaceholder: "Selecciona tu rol",
		industryLabel: "Industria",
		industryPlaceholder: "Selecciona tu industria",
		challengeLabel: "Tu desafío",
		challengePlaceholder:
			"Ej: Necesitamos reducir el consumo de agua en nuestras operaciones mineras un 30% en 18 meses",
		timelineLabel: "Plazo",
		timelinePlaceholder: "Selecciona un plazo",
		notesLabel: "Notas adicionales",
		notesPlaceholder: "¿Algo más que debamos saber?",
		trustStep1: "Sin compromiso",
		trustStep2: "Respondemos en 2 días hábiles",
		required: "Obligatorio",
		invalidEmail: "Por favor ingresa un correo electrónico válido",
		fieldRequired: "Este campo es obligatorio",
		submitError: "Algo salió mal. Por favor intenta de nuevo.",
		successTitle: "Recibimos tu solicitud",
		successMessage:
			"Nuestro equipo revisará y responderá en un plazo de 2 días hábiles con opciones deeptech relevantes.",
		done: "Listo",
		contactTitle: "Contáctanos",
		contactSubtitle:
			"Cuéntanos sobre tus necesidades deeptech y encontraremos las soluciones adecuadas.",
		contactNextLabel: "Qué sigue",
		contactNextStep1Title: "Leemos cada palabra",
		contactNextStep1Desc:
			"Tu mensaje llega directo a los socios de 404 Tech Found — sin bots, sin colas de triage.",
		contactNextStep2Title: "Respondemos en 24h",
		contactNextStep2Desc:
			"Un founder responde con una primera lectura, preguntas clarificadoras o una lista corta de startups deeptech que vale la pena conocer.",
		contactNextStep3Title: "Agendamos una llamada de 30 minutos",
		contactNextStep3Desc:
			"Si hay encaje, alineamos alcance, te presentamos a los builders relevantes y trazamos un camino de piloto.",
		contactResponsePromise: "Respondemos en 24h, lun–vie",
		contactPrivacyNote:
			"Solo los socios de 404tf ven esto. Nunca compartido, nunca vendido — manejo GDPR-ready.",
		contactEmailHeading: "¿Prefieres email?",
		contactEmailLead: "Salta el formulario. Escribe directo y lo recibimos igual.",
		contactEmailCta: "Escribe a hello@404tf.com",
		contactOtherHeading: "Otras formas de contacto",
		contactOtherLinkedinSoon: "LinkedIn — próximamente",
		contactOtherTwitterSoon: "X / Twitter — próximamente",
		roles: {
			innovation_director: "Director de Innovación",
			cto: "CTO / VP Ingeniería",
			procurement: "Compras",
			strategy: "Estrategia",
			government: "Funcionario de Gobierno",
			vc: "VC / Inversionista",
			other: "Otro",
		},
		industries: {
			mining: "Minería",
			energy: "Energía",
			agriculture: "Agricultura",
			manufacturing: "Manufactura",
			financial: "Servicios Financieros",
			healthcare: "Salud",
			logistics: "Logística",
			retail: "Retail",
			telecom: "Telecomunicaciones",
			government: "Gobierno / Sector Público",
			other: "Otro",
		},
		timelines: {
			exploring: "Solo explorando",
			"1_3": "1-3 meses",
			"3_6": "3-6 meses",
			"6_12": "6-12 meses",
		},
	},
	profile: {
		breadcrumbDirectory: "Directorio",
		technology: "Tecnología",
		keyResults: "Resultados Clave",
		theProblem: "El Problema",
		businessModel: "Modelo de Negocio",
		relatedStartups: "Startups Relacionadas",
		moreIn: "Más en",
		founded: "Fundada",
		teamSize: "Equipo",
		people: "personas",
		sidebarTitle: "¿Necesitas una solución así?",
		sidebarStep1: "Entender tu desafío",
		sidebarStep2: "Analizar startups relevantes",
		sidebarStep3: "Facilitar un piloto",
		sidebarExplore: "O explora startups similares abajo",
		claimTitle: "¿Eres parte de {name}?",
		claimButton: "Reclamar este perfil",
		incompleteProfile: "Este perfil está siendo completado por el equipo de la startup.",
		visitWebsite: "Visitar sitio web",
		resultTypeProduct: "Producto",
		resultTypeMetric: "Métrica",
		resultTypePartnership: "Alianza",
		resultTypeAward: "Reconocimiento",
		resultTypePatent: "Patente",
		resultTypePublication: "Publicación",
		claimNameLabel: "Tu nombre",
		claimNamePlaceholder: "Tu nombre completo",
		claimRoleLabel: "Tu rol",
		claimRolePlaceholder: "Ej: CEO, CTO, Co-Fundador",
		claimEmailLabel: "Correo electrónico",
		claimEmailPlaceholder: "tu@startup.com",
		claimProofLabel: "Prueba de asociación",
		claimProofPlaceholder:
			"Ej: comparte el dominio de correo de tu empresa, perfil de LinkedIn u otra verificación",
		claimSubmit: "Enviar solicitud",
		claimSubmitting: "Enviando...",
		claimSuccess:
			"Solicitud de reclamo recibida. Nuestro equipo revisará en un plazo de 5 días hábiles.",
		claimRequired: "Obligatorio",
		claimInvalidEmail: "Por favor ingresa un correo electrónico válido",
		claimSubmitError: "Algo salió mal. Por favor intenta de nuevo.",
	},
	insights: {
		title: "El Estado del Deeptech",
		subtitle:
			"Donde América Latina forja en silencio su tecnología más dura — por país, vertical, cohorte y etapa. Primera edición, 2026.",
		byline: "Un reporte de 404 Mapped",
		heroKicker: "ESTADO · 2026 · MARZO",
		execStartups: "Startups Mapeadas",
		execStartupsCompare: "Primera edición, 2026",
		execCountries: "Países",
		execCountriesCompare: "En toda LATAM",
		execFunding: "Financiamiento Total Declarado",
		execFundingCompare: "De {pct}% de startups con datos",
		geoTitle: "¿Dónde está el deeptech?",
		geoLabel: "DISTRIBUCIÓN GEOGRÁFICA",
		geoKicker: "DÓNDE VIVE EL DEEPTECH",
		geoInsight:
			"{leader} domina con {leaderCount} startups — {multiple}× {second}. El mapa está concentrado, no disperso.",
		verticalTitle: "¿Qué están construyendo?",
		verticalLabel: "DESGLOSE POR VERTICAL",
		verticalKicker: "LO QUE CONSTRUYEN",
		verticalInsight:
			"{leader} lidera con {count} startups. Las tres principales verticales capturan el {share}% de todas las etiquetas.",
		verticalTopThree: "TOP 3",
		foundingTitle: "¿Cuándo empezaron?",
		foundingLabel: "LÍNEA TEMPORAL DE FUNDACIÓN",
		foundingKicker: "CUÁNDO EMPEZARON",
		foundingInsight:
			"{year} fue el año pico — {count} nuevas startups. El {pct}% del cohorte se fundó en los últimos cinco años.",
		foundingPeakAnnotation: "PICO · {year}",
		maturityTitle: "¿Qué tan maduros son?",
		maturityLabel: "DISTRIBUCIÓN DE MADUREZ",
		maturityKicker: "QUÉ TAN MADUROS",
		maturityInsight:
			"{earlyPct}% aún en I+D o prototipo. La frontera comercial es delgada — solo {commercialPct}% en piloto o ingresos.",
		fundingTitle: "Sigue el dinero",
		fundingLabel: "PANORAMA DE FINANCIAMIENTO",
		fundingKicker: "SIGUE EL DINERO",
		fundingInsight:
			"{total} levantados en {count} startups — las tres principales capturan el {share}% del capital declarado.",
		fundingTotal: "Total Declarado",
		fundingWithData: "Con Datos de Financiamiento",
		fundingAvg: "Ronda Promedio",
		insightTag: "INSIGHT",
		sourceLine: "Fuente: base de datos 404 Mapped · abril 2026",
		pdfTitle: "Descarga el Reporte Completo",
		pdfSubtitle: "Primera edición, 2026",
		pdfTrust: "PDF gratuito con análisis extendido y metodología.",
		pdfNameLabel: "Nombre",
		pdfNamePlaceholder: "Tu nombre",
		pdfEmailLabel: "Correo electrónico",
		pdfEmailPlaceholder: "tu@empresa.com",
		pdfSubmit: "Descargar Reporte",
		pdfSuccess: "Te enviaremos el reporte a tu correo cuando esté disponible.",
		pdfPrivacy: "Respetamos tu privacidad. Sin spam, nunca.",
		pdfRequired: "Obligatorio",
		pdfInvalidEmail: "Por favor ingresa un correo válido",
		pdfError: "Algo salió mal. Intenta de nuevo.",
		ctaTitle: "¿Buscas una solución deeptech?",
		startups: "startups",
	},
	startupsPage: {
		getOnMapTitle: "Pon tu startup frente a corporativos, inversionistas y el ecosistema",
		getOnMapSubtitle: "Aplica para unirte al directorio de 404 Mapped",
		valuePropVisibility: "Visibilidad",
		valuePropVisibilityDesc:
			"Tu perfil es visto por corporativos, VCs y líderes del ecosistema en toda LATAM.",
		valuePropCredibility: "Credibilidad",
		valuePropCredibilityDesc:
			"Ser seleccionado para el directorio señala rigor deeptech y tracción.",
		valuePropConnections: "Conexiones",
		valuePropConnectionsDesc:
			"404tf facilita presentaciones con empresas que buscan soluciones deeptech.",
		qualifiesTitle: "¿Quién califica?",
		qualifiesDesc:
			"Aceptamos startups que construyen tecnología profunda: ciencia propietaria, ingeniería novedosa o fosos técnicos difíciles de replicar. Empresas solo de software o servicios digitales puros no califican. Debes estar basado u operar principalmente en América Latina.",
		applyStep1Title: "Tus datos",
		applyStep2Title: "Sobre tu startup",
		applyStepOf: "Paso {current} de {total}",
		applyStartupName: "Nombre de la startup",
		applyStartupNamePlaceholder: "El nombre de tu startup",
		applyWebsite: "Sitio web",
		applyWebsitePlaceholder: "https://tustartup.com",
		applyYourName: "Tu nombre",
		applyYourNamePlaceholder: "Tu nombre completo",
		applyYourRole: "Tu rol",
		applyYourRolePlaceholder: "Ej: CEO, CTO, Fundador",
		applyEmail: "Correo electrónico",
		applyEmailPlaceholder: "tu@startup.com",
		applyCountry: "País",
		applyCountryPlaceholder: "Selecciona país",
		applyVertical: "Vertical principal",
		applyVerticalPlaceholder: "Selecciona vertical",
		applyMaturity: "Nivel de madurez",
		applyMaturityPlaceholder: "Selecciona madurez",
		applyOneLiner: "Frase resumen",
		applyOneLinerPlaceholder: "Describe lo que hace tu startup en una oración",
		applyWhy: "¿Por qué deberíamos incluirte?",
		applyWhyPlaceholder:
			"¿Qué hace única tu tecnología y por qué debería importarle a los corporativos?",
		applySuccess: "Aplicación recibida. Revisamos en un plazo de 5 días hábiles.",
		programTitle: "¿Listo para vender a corporativos?",
		programSubtitle: "Ayudamos a startups deeptech a cerrar sus primeros acuerdos con empresas.",
		tierAssess: "Evaluar",
		tierAssessDesc:
			"Diagnóstico de preparación comercial, revisión de posicionamiento, brief competitivo.",
		tierPrepare: "Preparar",
		tierPrepareDesc:
			"Reestructuración de pitch deck, desarrollo de propuesta de valor, guía de precios, propuesta de prueba.",
		tierConnect: "Conectar",
		tierConnectDesc:
			"Presentaciones curadas con corporativos, facilitación de reuniones, alcance de pilotos, soporte de cierre.",
		programStartupName: "Nombre de la startup",
		programYourName: "Tu nombre",
		programEmail: "Correo electrónico",
		programTier: "¿Qué nivel te interesa?",
		programTierPlaceholder: "Selecciona un nivel",
		programDescription: "Cuéntanos sobre tu startup",
		programDescriptionPlaceholder:
			"¿Qué construyes, en qué etapa de ventas estás y qué tipo de apoyo te ayudaría más?",
		programSuccess: "Consulta recibida. Nos pondremos en contacto en 3 días hábiles.",
		tierNotSure: "Aún no estoy seguro",
		footerNote: "¿Ya estás en el directorio?",
		footerClaimLink: "Reclama tu perfil para gestionar tu página.",
		required: "Obligatorio",
		invalidEmail: "Por favor ingresa un correo electrónico válido",
		fieldRequired: "Este campo es obligatorio",
		submitError: "Algo salió mal. Por favor intenta de nuevo.",
	},
	about: {
		aboutTitle: "Sobre 404 Tech Found",
		aboutP1:
			"404 Tech Found es un constructor de ecosistemas deeptech con base en Lima, Perú. Existimos porque América Latina tiene talento científico de clase mundial, pero la infraestructura para conectarlo con la industria está rota.",
		aboutP2:
			"Mapeamos, validamos y conectamos startups deeptech con corporativos, gobiernos e inversionistas que necesitan soluciones de siguiente generación. Nuestro trabajo se sitúa en la intersección de consultoría de innovación abierta, inteligencia de ecosistemas y habilitación de startups.",
		aboutP3:
			"404 Mapped es nuestra plataforma insignia: un directorio curado de 50+ startups deeptech en América Latina, diseñado para hacer visibles y accesibles a los constructores más ambiciosos de la región.",
		teamTitle: "El Equipo",
		methodologyTitle: "Metodología",
		methodStep1Title: "400+ Fuentes",
		methodStep1Desc:
			"Rastreamos más de 400 startups de aceleradoras, programas universitarios, portafolios de inversionistas y socios del ecosistema en LATAM.",
		methodStep2Title: "Criterios deeptech aplicados",
		methodStep2Desc:
			"Cada startup fue evaluada en tecnología propietaria, novedad científica y profundidad de foso técnico. Empresas solo de software y servicios puros fueron excluidas.",
		methodStep3Title: "Tracción validada",
		methodStep3Desc:
			"Verificamos las afirmaciones contra datos públicos, referencias de socios y conversaciones directas. Resultados clave y alianzas fueron verificados.",
		methodStep4Title: "50+ Seleccionadas",
		methodStep4Desc:
			"La selección final representa las startups deeptech más creíbles y validadas por tracción de la región. El directorio crece a medida que nuevas startups aplican y son revisadas.",
		collaboratorsTitle: "Colaboradores",
		collaboratorPlaceholder: "Socio",
		ctaTitle: "¿Preguntas?",
		ctaEmail: "hello@404tf.com",
	},
} as const satisfies Translations;

const translations: Record<Locale, Translations> = { en, es };

export function getTranslations(locale: Locale): Translations {
	return translations[locale];
}
