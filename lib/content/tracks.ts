export type LessonKind = 'micro' | 'scenario' | 'quiz';

export interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  estMinutes: number;
  body: string;
  /** Scenario id when kind === 'scenario', quiz id when kind === 'quiz'. */
  activityId?: string;
}

export interface Module {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
}

export interface Track {
  id: string;
  slug: string;
  title: string;
  summary: string;
  accent: 'brand' | 'emerald' | 'amber' | 'violet';
  modules: Module[];
}

export const TRACKS: Track[] = [
  {
    id: 'governance',
    slug: 'governance',
    title: 'Governance & Information Security Strategy',
    summary:
      'Enterprise risk governance, policy architecture, business alignment and third-party risk.',
    accent: 'brand',
    modules: [
      {
        id: 'gov-mod-1',
        title: 'Enterprise risk governance',
        summary: 'Board reporting lines, risk appetite and the three lines model.',
        lessons: [
          {
            id: 'gov-1-1',
            title: 'The three lines model',
            kind: 'micro',
            estMinutes: 5,
            body:
              'The three lines model separates ownership of risk from oversight of risk. The first line owns and manages risk day to day. The second line, usually risk and compliance, sets the guardrails and challenges the first line. The third line, internal audit, provides independent assurance to the board. Confusing the lines is a common audit finding: when the second line starts owning controls, no one is left to challenge them.',
          },
          {
            id: 'gov-1-2',
            title: 'Risk appetite and board reporting',
            kind: 'micro',
            estMinutes: 6,
            body:
              'Risk appetite is the amount of risk an organisation is willing to accept to reach its objectives. It must be written down, measurable and traceable to indicators. Boards rarely want raw breach counts. They want the trend against appetite, the top exposures, and the decisions needed. A good board pack states: here is our appetite, here is where we sit, here is what we are doing.',
          },
          {
            id: 'gov-1-3',
            title: 'Scenario: the quarterly board pack',
            kind: 'scenario',
            estMinutes: 8,
            activityId: 'scn-board-pack',
            body: 'Play the GRC Lead preparing a contentious board report.',
          },
          {
            id: 'gov-1-4',
            title: 'Policy, standards, procedure, baseline',
            kind: 'micro',
            estMinutes: 5,
            body:
              'A policy states intent and is approved by management. A standard states mandatory requirements that satisfy the policy. A procedure states the step-by-step instructions. A baseline is the minimum secure configuration. The hierarchy matters because auditors test whether your lowest-level documents trace back to an approved policy, and whether they are actually followed.',
          },
        ],
      },
      {
        id: 'gov-mod-2',
        title: 'Policy architecture & alignment',
        summary: 'ISO 27001 leadership clauses, COBIT and business strategy alignment.',
        lessons: [
          {
            id: 'gov-2-1',
            title: 'ISO/IEC 27001 leadership clauses',
            kind: 'micro',
            estMinutes: 6,
            body:
              'Clauses 4 to 10 of ISO/IEC 27001:2022 form the management system. Clause 5 puts accountability on top management, not on the security team. Clause 6 requires risk-based planning. Clause 7 covers competence and awareness. Clause 9 requires internal audit and management review. Clause 10 requires improvement. Annex A controls only work when these clauses are alive.',
          },
          {
            id: 'gov-2-2',
            title: 'Aligning security to business strategy',
            kind: 'micro',
            estMinutes: 5,
            body:
              'Security earns budget when it speaks in business language. Map each control to a business objective such as revenue protection, uptime, or market access. COBIT provides a governance framework that ties IT goals to enterprise goals. When you can show that a control protects a revenue stream, the conversation changes from cost to investment.',
          },
          {
            id: 'gov-2-3',
            title: 'Mini-quiz: governance foundations',
            kind: 'quiz',
            estMinutes: 4,
            activityId: 'quiz-gov-1',
            body: 'Check your understanding of governance structures.',
          },
        ],
      },
      {
        id: 'gov-mod-3',
        title: 'Vendor & third-party risk (TPRM)',
        summary: 'Vendor tiering, due diligence and ongoing monitoring.',
        lessons: [
          {
            id: 'gov-3-1',
            title: 'Tiering your vendors',
            kind: 'micro',
            estMinutes: 5,
            body:
              'Not every vendor needs a full assessment. Tier vendors by data sensitivity, system access and business criticality. Tier 1 vendors hold regulated data or have privileged access and need deep due diligence plus continuous monitoring. Tier 3 vendors may only need a security questionnaire. Tiering keeps the programme honest and affordable.',
          },
          {
            id: 'gov-3-2',
            title: 'Ongoing monitoring, not one-off checks',
            kind: 'micro',
            estMinutes: 5,
            body:
              'A vendor that passed last year may be a liability today. Ongoing monitoring uses continuous feeds: SOC 2 reports, breach notifications, financial health, and control attestations. Set contractual rights to audit and to be notified of material changes. The weakest link in your supply chain is often the vendor you stopped watching.',
          },
        ],
      },
    ],
  },
  {
    id: 'risk',
    slug: 'risk',
    title: 'Risk Management & Assessment',
    summary:
      'Identification, analysis, evaluation and response. KRIs, KPIs, BIA and BCP.',
    accent: 'emerald',
    modules: [
      {
        id: 'risk-mod-1',
        title: 'Risk identification & analysis',
        summary: 'Qualitative and quantitative analysis methods.',
        lessons: [
          {
            id: 'risk-1-1',
            title: 'Qualitative vs quantitative analysis',
            kind: 'micro',
            estMinutes: 6,
            body:
              'Qualitative analysis uses scales such as low, medium, high. It is fast and works when data is thin. Quantitative analysis uses numbers: annualised loss expectancy, monetary ranges, frequency estimates. Quantitative analysis survives budget conversations because it talks in currency. The best programmes combine both, using qualitative screening then quantitative depth on the top risks.',
          },
          {
            id: 'risk-1-2',
            title: 'Likelihood times impact',
            kind: 'micro',
            estMinutes: 5,
            body:
              'The classic risk score multiplies likelihood by impact. The trap is treating the score as truth. Two risks scoring 12 may have very different profiles. Always keep the underlying likelihood and impact visible, and define what each number means in your scale so different teams score consistently.',
          },
          {
            id: 'risk-1-3',
            title: 'Scenario: the cloud migration risk',
            kind: 'scenario',
            estMinutes: 8,
            activityId: 'scn-cloud-migration',
            body: 'Assess a rushed cloud migration as the risk lead.',
          },
          {
            id: 'risk-1-4',
            title: 'Mini-quiz: risk analysis',
            kind: 'quiz',
            estMinutes: 4,
            activityId: 'quiz-risk-1',
            body: 'Test your grasp of risk scoring and treatment.',
          },
        ],
      },
      {
        id: 'risk-mod-2',
        title: 'Risk response strategies',
        summary: 'Mitigate, transfer, accept, avoid and the treatment plan.',
        lessons: [
          {
            id: 'risk-2-1',
            title: 'The four responses',
            kind: 'micro',
            estMinutes: 6,
            body:
              'Mitigate reduces likelihood or impact with controls. Transfer shifts financial exposure, for example through insurance or contractual indemnities. Accept knowingly retains the risk within appetite and requires a named owner and a review date. Avoid removes the activity entirely. Every response needs an owner, a date and a way to measure whether it worked.',
          },
          {
            id: 'risk-2-2',
            title: 'KRIs and KPIs',
            kind: 'micro',
            estMinutes: 5,
            body:
              'A KPI measures performance, such as percentage of patches applied on time. A KRI measures risk exposure, such as number of critical vulnerabilities older than 30 days. KRIs need thresholds: green below the line, amber near it, red over it, with a defined action at each level. Without thresholds a KRI is just a number.',
          },
        ],
      },
      {
        id: 'risk-mod-3',
        title: 'BIA and continuity planning',
        summary: 'Business impact analysis, RTO/RPO and recovery strategy.',
        lessons: [
          {
            id: 'risk-3-1',
            title: 'Business impact analysis',
            kind: 'micro',
            estMinutes: 6,
            body:
              'A business impact analysis identifies critical processes and how quickly their loss hurts the organisation. It produces recovery time objectives and recovery point objectives. The BIA drives the continuity plan: you cannot plan recovery until you know what must come back first and how much data loss is tolerable.',
          },
          {
            id: 'risk-3-2',
            title: 'Disaster recovery and BCP testing',
            kind: 'micro',
            estMinutes: 6,
            body:
              'A plan that has never been tested is a document, not a capability. Test from tabletop walkthroughs to full failover exercises. Record what broke, fix it, and retest. Auditors ask for evidence of testing and evidence that lessons were acted on. Untested plans are the most common false comfort in resilience.',
          },
        ],
      },
    ],
  },
  {
    id: 'compliance',
    slug: 'compliance',
    title: 'Compliance & Regulatory Frameworks',
    summary:
      'Privacy law, NIST CSF 2.0, ISO 27001:2022, CIS, SOC 2, PCI-DSS, FedRAMP and AI governance.',
    accent: 'amber',
    modules: [
      {
        id: 'comp-mod-1',
        title: 'Global privacy law',
        summary: 'GDPR, CCPA/CPRA and HIPAA essentials.',
        lessons: [
          {
            id: 'comp-1-1',
            title: 'GDPR in plain terms',
            kind: 'micro',
            estMinutes: 6,
            body:
              'GDPR governs personal data of people in the EU. You need a lawful basis to process data, you must honour data subject rights, and you must report certain breaches within 72 hours. The principles are familiar: lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity and accountability. Accountability means you can prove compliance, not just claim it.',
          },
          {
            id: 'comp-1-2',
            title: 'CCPA, CPRA and HIPAA',
            kind: 'micro',
            estMinutes: 6,
            body:
              'CCPA and its amendment CPRA give California residents rights over their personal information, including the right to know, delete and opt out of sale. HIPAA protects protected health information in the United States and sets privacy, security and breach notification rules. Many organisations must satisfy several regimes at once, so build a single control set that maps to all of them.',
          },
          {
            id: 'comp-1-3',
            title: 'Scenario: the data subject request',
            kind: 'scenario',
            estMinutes: 8,
            activityId: 'scn-dsar',
            body: 'Handle a data subject access request against a tight deadline.',
          },
        ],
      },
      {
        id: 'comp-mod-2',
        title: 'Cybersecurity frameworks',
        summary: 'NIST CSF 2.0, ISO 27001:2022 and CIS Controls.',
        lessons: [
          {
            id: 'comp-2-1',
            title: 'NIST CSF 2.0 functions',
            kind: 'micro',
            estMinutes: 6,
            body:
              'NIST CSF 2.0 organises outcomes into six functions: Govern, Identify, Protect, Detect, Respond and Recover. Govern is new in version 2.0 and elevates strategy, roles and risk management to the top. The framework is outcome based, not prescriptive, so you map your existing controls to its subcategories and look for gaps.',
          },
          {
            id: 'comp-2-2',
            title: 'ISO 27001:2022 Annex A',
            kind: 'micro',
            estMinutes: 6,
            body:
              'ISO/IEC 27001:2022 arranges Annex A controls into four themes: organisational, people, physical and technological, with 93 controls. The Statement of Applicability lists each control, whether it applies, and the justification. Excluding a control is allowed, but the justification must be defensible against your risk assessment.',
          },
          {
            id: 'comp-2-3',
            title: 'Framework matrix: match control to function',
            kind: 'quiz',
            estMinutes: 5,
            activityId: 'quiz-comp-1',
            body: 'Drag-and-drop style matching of controls to CSF functions.',
          },
        ],
      },
      {
        id: 'comp-mod-3',
        title: 'Financial, cloud and AI standards',
        summary: 'SOC 2, PCI-DSS 4.0, FedRAMP and AI governance.',
        lessons: [
          {
            id: 'comp-3-1',
            title: 'SOC 2 Type I vs Type II',
            kind: 'micro',
            estMinutes: 6,
            body:
              'SOC 2 reports on the Trust Services Criteria: security, availability, processing integrity, confidentiality and privacy. Type I reports on design at a point in time. Type II reports on operating effectiveness over a period, usually three to twelve months. Customers increasingly demand Type II because it shows the controls actually worked over time.',
          },
          {
            id: 'comp-3-2',
            title: 'PCI-DSS 4.0 and FedRAMP',
            kind: 'micro',
            estMinutes: 6,
            body:
              'PCI-DSS 4.0 governs organisations that store, process or transmit card data, adding a customised approach and stronger authentication requirements. FedRAMP standardises security assessment for cloud services sold to US government. Both are heavy on evidence, which is why automation and continuous compliance matter for cost control.',
          },
          {
            id: 'comp-3-3',
            title: 'AI governance and the NIST AI RMF',
            kind: 'micro',
            estMinutes: 6,
            body:
              'The NIST AI Risk Management Framework organises AI risk work into four functions: Govern, Map, Measure and Manage. The EU AI Act adds a risk-tiered legal regime, banning some uses and imposing heavy duties on high-risk systems. AI governance extends classic GRC to model provenance, bias testing, human oversight and monitoring in production.',
          },
        ],
      },
    ],
  },
  {
    id: 'audit',
    slug: 'audit',
    title: 'IT Audit & Control Testing',
    summary:
      'Audit lifecycle, design versus operating effectiveness, evidence and remediation.',
    accent: 'violet',
    modules: [
      {
        id: 'audit-mod-1',
        title: 'The audit lifecycle',
        summary: 'Internal vs external audit and the phases of an engagement.',
        lessons: [
          {
            id: 'audit-1-1',
            title: 'Internal vs external audit',
            kind: 'micro',
            estMinutes: 5,
            body:
              'Internal audit reports to the board or audit committee and serves the organisation. External audit serves third parties such as regulators, shareholders or customers. Internal audit can advise on control design. External audit must remain independent, so it tests and reports rather than designs. Mixing these roles damages independence.',
          },
          {
            id: 'audit-1-2',
            title: 'Audit phases',
            kind: 'micro',
            estMinutes: 6,
            body:
              'The lifecycle runs from planning and scoping, through fieldwork and evidence gathering, to reporting and follow-up. Planning decides what is in scope and why. Fieldwork tests controls. Reporting states findings against criteria. Follow-up verifies that corrective actions actually happened. The follow-up phase is where audits create value or are quietly forgotten.',
          },
          {
            id: 'audit-1-3',
            title: 'Scenario: the disputed audit finding',
            kind: 'scenario',
            estMinutes: 8,
            activityId: 'scn-audit-finding',
            body: 'Defend or concede an audit finding under pressure.',
          },
        ],
      },
      {
        id: 'audit-mod-2',
        title: 'Design vs operating effectiveness',
        summary: 'Testing whether a control is built well and works in practice.',
        lessons: [
          {
            id: 'audit-2-1',
            title: 'Design effectiveness',
            kind: 'micro',
            estMinutes: 5,
            body:
              'Design effectiveness asks whether a control, as designed, would prevent or detect the risk if it operated as intended. You test design by inspecting the control description, walking through one instance, and comparing to the criteria. A perfectly executed control that does not address the risk is still a design failure.',
          },
          {
            id: 'audit-2-2',
            title: 'Operating effectiveness',
            kind: 'micro',
            estMinutes: 6,
            body:
              'Operating effectiveness asks whether the control actually worked throughout the period. You sample instances and inspect evidence. A control can pass design and fail operating effectiveness, for example when approvals were skipped during a busy period. Auditors care about the full population, not just the instance management selects for you.',
          },
        ],
      },
      {
        id: 'audit-mod-3',
        title: 'Evidence, sampling & remediation',
        summary: 'Evidence quality, sampling, working papers and CAPs.',
        lessons: [
          {
            id: 'audit-3-1',
            title: 'Evidence and sampling',
            kind: 'micro',
            estMinutes: 6,
            body:
              'Evidence should be sufficient, reliable and relevant. System-generated evidence beats a screenshot of a spreadsheet. Sampling can be statistical or judgemental, but the method and rationale must be documented. Working papers record what you tested, what you found, and how you concluded, so another auditor could repeat your work.',
          },
          {
            id: 'audit-3-2',
            title: 'Findings, CAPs and monitoring',
            kind: 'micro',
            estMinutes: 6,
            body:
              'A finding states the condition, criteria, cause, effect and recommendation. A corrective action plan names an owner and a date for each action and is tracked to closure. Continuous monitoring tests controls automatically between audits so issues surface early. A finding without an owner and a date is a wish, not a plan.',
          },
          {
            id: 'audit-3-3',
            title: 'Mini-quiz: audit mastery',
            kind: 'quiz',
            estMinutes: 5,
            activityId: 'quiz-audit-1',
            body: 'Final check across the audit track.',
          },
        ],
      },
    ],
  },
];

export const TRACKS_BY_ID = Object.fromEntries(TRACKS.map((t) => [t.id, t]));

export function totalLessons(): number {
  return TRACKS.reduce(
    (sum, t) => sum + t.modules.reduce((m, mod) => m + mod.lessons.length, 0),
    0,
  );
}
