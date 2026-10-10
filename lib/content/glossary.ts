/**
 * Curated plain-English explainer entries. Used directly when no language
 * model key is configured, and as grounding context when one is.
 */
export interface GlossaryEntry {
  term: string;
  /** Alternative names people type, such as acronyms or short forms. */
  aliases?: string[];
  plain: string;
  whyItMatters: string;
  example: string;
  tags: string[];
}

function namesFor(entry: GlossaryEntry): string[] {
  return [entry.term, ...(entry.aliases ?? []), ...entry.tags].map((n) => n.toLowerCase());
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Lawful basis',
    plain:
      'A reason the law accepts for using someone\'s personal data. There are six, such as consent or a contract.',
    whyItMatters:
      'Without a lawful basis, processing personal data is unlawful even if you handle it carefully.',
    example:
      'Sending a customer their own order confirmation relies on the contract basis, not on consent.',
    tags: ['gdpr', 'privacy'],
  },
  {
    term: 'Data minimisation',
    plain: 'Collect only the personal data you actually need for the stated purpose, and no more.',
    whyItMatters:
      'Extra data is extra risk. You cannot breach data you never collected.',
    example: 'An age check needs a birth year, not a full date of birth and a passport scan.',
    tags: ['gdpr', 'privacy'],
  },
  {
    term: '72-hour breach notification',
    plain:
      'If a personal data breach is likely to risk people\'s rights, you must tell the regulator within 72 hours of becoming aware.',
    whyItMatters:
      'The clock starts at awareness, not at the end of your investigation, so triage must be fast.',
    example:
      'A lost unencrypted laptop holding customer records triggers the assessment and likely a notification.',
    tags: ['gdpr', 'breach'],
  },
  {
    term: 'Data subject access request (DSAR)',
    plain:
      'A person asking to see the personal data you hold about them. You must respond within a set deadline, usually 30 days.',
    whyItMatters:
      'Missed or partial responses are a common regulatory finding and a clear breach of the right of access.',
    example: 'A customer asks for all data held about them across your CRM, billing and support tools.',
    tags: ['gdpr', 'ccpa', 'privacy'],
  },
  {
    term: 'Statement of Applicability (SoA)',
    plain:
      'A document listing every ISO 27001 Annex A control, saying whether it applies to you and why.',
    whyItMatters:
      'It is the bridge between your risk assessment and your controls, and auditors read it first.',
    example:
      'You exclude physical security controls for a fully cloud service, and justify it by showing no owned facilities.',
    tags: ['iso27001', 'isms'],
  },
  {
    term: 'Control design vs operating effectiveness',
    plain:
      'Design asks whether a control would work if used. Operating effectiveness asks whether it actually worked over time.',
    whyItMatters:
      'A control can be well designed and still fail in practice, which is exactly what auditors test.',
    example:
      'Approvals exist in policy (design) but six of forty changes were deployed without one (operating).',
    tags: ['audit', 'soc2'],
  },
  {
    term: 'Risk appetite',
    plain: 'The amount of risk the organisation is willing to accept to reach its goals.',
    whyItMatters:
      'Without a stated appetite, every risk decision becomes a matter of opinion.',
    example:
      'A bank might accept low operational risk but tolerate higher technology risk for innovation.',
    tags: ['risk', 'governance'],
  },
  {
    term: 'Likelihood times impact',
    plain:
      'A simple risk score made by multiplying how likely a risk is by how bad it would be.',
    whyItMatters:
      'It ranks risks fast, but the underlying numbers and their meanings still matter.',
    example: 'Likelihood 4, impact 3 gives a score of 12.',
    tags: ['risk'],
  },
  {
    term: 'Trust Services Criteria (TSC)',
    plain:
      'The five areas SOC 2 examines: security, availability, processing integrity, confidentiality and privacy.',
    whyItMatters:
      'Customers use a SOC 2 report to judge whether your controls protect their data.',
    example:
      'A vendor claims SOC 2 but the report only covers security, so availability claims are unsupported.',
    tags: ['soc2', 'audit'],
  },
  {
    term: 'FedRAMP',
    plain:
      'A US government programme that standardises how cloud services are assessed and authorised for federal use.',
    whyItMatters:
      'It is heavy on evidence and continuous monitoring, so it drives automation in compliance teams.',
    example: 'A cloud provider seeking federal contracts must reach a FedRAMP authorisation.',
    tags: ['cloud', 'compliance'],
  },
  {
    term: 'NIST AI RMF',
    plain:
      'A framework for managing AI risk through four functions: Govern, Map, Measure and Manage.',
    whyItMatters:
      'It gives a shared language for AI risk, from model provenance to monitoring in production.',
    example: 'A hiring model is mapped for bias, measured against thresholds and monitored after launch.',
    tags: ['ai', 'compliance'],
  },
  {
    term: 'Corrective Action Plan (CAP)',
    plain:
      'The list of actions that fix an audit finding, each with an owner and a due date.',
    whyItMatters:
      'A finding without an owner, a date and a check is a wish, not a plan.',
    example: 'Add change approval step, train staff, name an owner, set a date, then retest in 90 days.',
    tags: ['audit', 'remediation'],
  },
  {
    term: 'ISO/IEC 27001:2022',
    aliases: ['iso 27001', 'iso27001', 'isms'],
    plain:
      'The international standard for running an information security management system, or ISMS. It is a management system standard with 93 Annex A controls.',
    whyItMatters:
      'Certification shows customers and regulators that you manage security as a repeatable system, not a one-off effort.',
    example: 'A cloud company scopes its ISMS, certifies to ISO 27001, then expands scope to new services.',
    tags: ['iso27001', 'isms', 'compliance'],
  },
  {
    term: 'NIST Cybersecurity Framework 2.0',
    aliases: ['nist csf', 'csf 2.0', 'nist csf 2.0', 'nist'],
    plain:
      'A voluntary framework that organises cybersecurity outcomes into six functions: Govern, Identify, Protect, Detect, Respond and Recover.',
    whyItMatters:
      'It gives a common language to set targets, measure maturity and prioritise spending across the whole lifecycle.',
    example: 'A team maps its controls to the six functions and reports a gap in the Recover function.',
    tags: ['nist', 'csf', 'framework'],
  },
  {
    term: 'SOC 2 Type II',
    aliases: ['soc 2', 'soc2', 'soc 2 type 2'],
    plain:
      'An independent audit report on whether a service organisation\'s controls worked over a period, judged against the Trust Services Criteria.',
    whyItMatters:
      'Enterprise buyers ask for it before they trust a vendor with their data, and Type II tests operation over time, not just design.',
    example: 'A SaaS vendor shares a SOC 2 Type II report covering a 12-month observation window.',
    tags: ['soc2', 'audit', 'cloud'],
  },
  {
    term: 'General Data Protection Regulation',
    aliases: ['gdpr', 'eu gdpr'],
    plain:
      'The European Union privacy law that sets rules for using personal data, with strong rights for people and heavy fines for breaches.',
    whyItMatters:
      'It applies to many organisations outside the EU, so it shapes global privacy programmes and vendor contracts.',
    example: 'The law requires a lawful basis for processing and notice within 72 hours of a reportable breach.',
    tags: ['gdpr', 'privacy', 'regulation'],
  },
  {
    term: 'PCI-DSS 4.0',
    aliases: ['pci dss', 'pci', 'pci-dss'],
    plain:
      'The payment card industry standard that protects cardholder data, with requirements for networks, access, monitoring and testing.',
    whyItMatters:
      'Any organisation that stores, processes or transmits card data must meet it or face losing the ability to take card payments.',
    example: 'An online store reduces scope by using a hosted payment page instead of handling card numbers.',
    tags: ['pci', 'compliance', 'payments'],
  },
];

export function findGlossaryEntry(text: string): GlossaryEntry | undefined {
  const lower = text.toLowerCase();
  return (
    GLOSSARY.find((e) => lower.includes(e.term.toLowerCase())) ??
    GLOSSARY.find((e) => (e.aliases ?? []).some((a) => lower.includes(a.toLowerCase()))) ??
    GLOSSARY.find((e) => e.tags.some((t) => lower.includes(t)))
  );
}

export function matchGlossary(text: string, limit = 3): GlossaryEntry[] {
  const lower = text.toLowerCase();
  const direct = GLOSSARY.filter((e) => namesFor(e).some((n) => lower.includes(n)));
  if (direct.length >= limit) return direct.slice(0, limit);
  const byTag = GLOSSARY.filter(
    (e) => !direct.includes(e) && e.tags.some((t) => lower.includes(t)),
  );
  return [...direct, ...byTag].slice(0, limit);
}
