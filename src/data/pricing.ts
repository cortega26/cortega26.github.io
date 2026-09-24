// Commercial pricing is defined here so the homepage, intake form, service
// pages, FAQs, and machine-readable content cannot drift independently.
//
// Stage rule (audit 2026-09-23, Plan 026): no amount may render without its
// stage label (diagnostic / build / retainer). Use engagementLine(),
// engagementCompact(), diagnosticLine(), or retainerLine() — never paste a
// bare value into copy.

export const pricing = {
  automation: {
    en: { scoping: '$290', scoped: '$1,500', multi: '$3,200', retainer: '$290/mo' },
    es: { scoping: '3 UF', scoped: '30 UF', multi: '60 UF', retainer: '6 UF/mes' },
  },
  internalTools: {
    en: { scoping: '$290', scoped: '$1,800', multi: '$3,600', retainer: '$290/mo' },
    es: { scoping: '3 UF', scoped: '35 UF', multi: '70 UF', retainer: '6 UF/mes' },
  },
  financial: {
    en: { scoping: '$390', scoped: '$2,400', multi: '$4,800', retainer: '$390/mo' },
    es: { scoping: '4 UF', scoped: '45 UF', multi: '90 UF', retainer: '8 UF/mes' },
  },
  staticSites: {
    en: { scoping: '$190', scoped: '$1,200', multi: '$2,600', retainer: '$150/mo' },
    es: { scoping: '2 UF', scoped: '25 UF', multi: '50 UF', retainer: '3 UF/mes' },
  },
  webHygiene: {
    en: { diagnostic: '$69', essentials: '$499', operational: '$899', integral: '$999', executiveUpgrade: '$100', retainer: '$279/mo' },
    es: { diagnostic: '1 UF', essentials: '7 UF', operational: '13 UF', integral: '15 UF', executiveUpgrade: '2 UF', retainer: '4 UF/mes' },
  },
} as const;

/** Numeric amount for schema.org price fields: "$69" → "69", "1 UF" → "1", "$279/mo" → "279". */
export function priceAmount(value: string): string {
  return value.replace(/[^0-9.]/g, '');
}

export type PricingLang = 'en' | 'es';
export type PricingServiceKey = 'automation' | 'internalTools' | 'financial' | 'staticSites' | 'webHygiene';

export interface EngagementStages {
  /** Entry diagnostic, credited toward the build. */
  diagnostic: string;
  /** Scoped build (HTW maps this to its "essentials" implementation tier). */
  build: string;
  /** Optional ongoing upkeep. */
  retainer: string;
}

export function engagementStages(lang: PricingLang, key: PricingServiceKey): EngagementStages {
  switch (key) {
    case 'automation':
      return {
        diagnostic: pricing.automation[lang].scoping,
        build: pricing.automation[lang].scoped,
        retainer: pricing.automation[lang].retainer,
      };
    case 'internalTools':
      return {
        diagnostic: pricing.internalTools[lang].scoping,
        build: pricing.internalTools[lang].scoped,
        retainer: pricing.internalTools[lang].retainer,
      };
    case 'financial':
      return {
        diagnostic: pricing.financial[lang].scoping,
        build: pricing.financial[lang].scoped,
        retainer: pricing.financial[lang].retainer,
      };
    case 'staticSites':
      return {
        diagnostic: pricing.staticSites[lang].scoping,
        build: pricing.staticSites[lang].scoped,
        retainer: pricing.staticSites[lang].retainer,
      };
    case 'webHygiene':
      return {
        diagnostic: pricing.webHygiene[lang].diagnostic,
        build: pricing.webHygiene[lang].essentials,
        retainer: pricing.webHygiene[lang].retainer,
      };
  }
}

/** "Diagnostic from $290" / "Diagnóstico desde 3 UF" */
export function diagnosticLine(lang: PricingLang, key: PricingServiceKey): string {
  const { diagnostic } = engagementStages(lang, key);
  return lang === 'en' ? `Diagnostic from ${diagnostic}` : `Diagnóstico desde ${diagnostic}`;
}

/** "Retainer from $290/mo" / "Retainer desde 6 UF/mes" */
export function retainerLine(lang: PricingLang, key: PricingServiceKey): string {
  const { retainer } = engagementStages(lang, key);
  return lang === 'en' ? `Retainer from ${retainer}` : `Retainer desde ${retainer}`;
}

/** Compact chip line: "Diagnostic $290 · Build $1,500" / "Diagnóstico 3 UF · Construcción 30 UF" */
export function engagementCompact(lang: PricingLang, key: PricingServiceKey): string {
  const { diagnostic, build } = engagementStages(lang, key);
  return lang === 'en'
    ? `Diagnostic ${diagnostic} · Build ${build}`
    : `Diagnóstico ${diagnostic} · Construcción ${build}`;
}

/** Full line: "Diagnostic from $290 · Build from $1,500 · Retainer from $290/mo" */
export function engagementLine(lang: PricingLang, key: PricingServiceKey): string {
  const { diagnostic, build, retainer } = engagementStages(lang, key);
  return lang === 'en'
    ? `Diagnostic from ${diagnostic} · Build from ${build} · Retainer from ${retainer}`
    : `Diagnóstico desde ${diagnostic} · Construcción desde ${build} · Retainer opcional desde ${retainer}`;
}
