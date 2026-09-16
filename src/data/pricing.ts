// Commercial pricing is defined here so the homepage, intake form, service
// pages, FAQs, and machine-readable content cannot drift independently.

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

export const engagementSummary = {
  en: {
    automation: `from ${pricing.automation.en.scoped}`,
    retainer: `from ${pricing.automation.en.retainer.replace('/mo', ' / month')}`,
    webDiagnostic: `from ${pricing.webHygiene.en.diagnostic} diagnostic`,
  },
  es: {
    automation: `desde ${pricing.automation.es.scoped}`,
    retainer: `desde ${pricing.automation.es.retainer.replace('/mes', ' / mes')}`,
    webDiagnostic: `desde ${pricing.webHygiene.es.diagnostic} diagnóstico`,
  },
} as const;
