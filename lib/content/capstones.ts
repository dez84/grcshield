export type EvidenceType = 'note' | 'file' | 'url' | 'checklist';

export interface CapstoneStep {
  id: string;
  title: string;
  detail: string;
  /** Copy-ready command block (docker, CLI, python). */
  command?: string;
}

export interface RubricCriterion {
  id: string;
  criterion: string;
  weight: number;
  evidenceType: EvidenceType;
}

export interface CapstoneProject {
  id: string;
  slug: string;
  title: string;
  objective: string;
  tools: string[];
  setup: string;
  deliverables: string[];
  difficulty: 'intermediate' | 'advanced' | 'expert';
  estHours: number;
  steps: CapstoneStep[];
  rubric: RubricCriterion[];
}

export const CAPSTONE_PROJECTS: CapstoneProject[] = [
  {
    id: 'cap-iso27001',
    slug: 'iso-27001-isms-soa',
    title: 'ISO 27001:2022 ISMS & Statement of Applicability builder',
    objective:
      'Design an Information Security Management System scope and draft a Statement of Applicability for a cloud-based enterprise.',
    tools: ['Eramba / open-source ISMS tool', 'GitHub or GitLab', 'Markdown editor'],
    setup:
      'Stand up an ISMS repository that is version controlled. Install a local ISMS tool with Docker if you want a GUI, or keep everything in Markdown for a lightweight audit trail. Confirm you have the ISO/IEC 27001:2022 Annex A control list to hand.',
    deliverables: [
      'An ISMS scope statement covering a defined cloud service boundary',
      'A mapped list of all 93 Annex A controls with applicability and justification',
      'Three core policies: Access Control, Incident Response, Vendor Management',
      'A peer-reviewable Statement of Applicability artifact committed to Git',
    ],
    difficulty: 'advanced',
    estHours: 10,
    steps: [
      {
        id: 'cap-iso27001-s1',
        title: 'Define the ISMS scope',
        detail:
          'Write a scope statement that names the cloud services, locations, teams and data in scope. State what is out of scope and why. This becomes the boundary every control and risk traces back to.',
      },
      {
        id: 'cap-iso27001-s2',
        title: 'Run the ISMS tool locally',
        detail:
          'Optionally launch Eramba or a similar open-source ISMS tool in Docker so you can model assets, risks and controls in a GUI. If you prefer plain files, skip the container and commit Markdown instead.',
        command:
          'docker run -d --name eramba -p 8080:80 \\\n  -e DB_HOST=db -e DB_NAME=eramba -e DB_USER=eramba -e DB_PASSWORD=change-me \\\n  eramba/eramba:latest\n\n# Open http://localhost:8080 and complete the setup wizard.',
      },
      {
        id: 'cap-iso27001-s3',
        title: 'Create the repository and policy skeleton',
        detail:
          'Initialise a Git repository and a folder structure for policies, the SoA and evidence. Every change should be a reviewed commit so the audit trail is tamper-evident.',
        command:
          'mkdir isms && cd isms && git init\nmkdir -p policies soa evidence\nprintf "# Statement of Applicability\\n" > soa/soa.md\ngit add . && git commit -m "Initialise ISMS repository"',
      },
      {
        id: 'cap-iso27001-s4',
        title: 'Map the 93 Annex A controls',
        detail:
          'For each Annex A control, record whether it applies, the justification for inclusion or exclusion, and the implementation status. Group controls by theme: organisational, people, physical, technological.',
      },
      {
        id: 'cap-iso27001-s5',
        title: 'Draft the three core policies',
        detail:
          'Write Access Control, Incident Response and Vendor Management policies. Each should state purpose, scope, requirements referencing standards, roles and review cadence. Keep them auditable and version controlled.',
      },
      {
        id: 'cap-iso27001-s6',
        title: 'Assemble and peer-review the SoA',
        detail:
          'Compile the SoA: control reference, applicability, justification, implementation and evidence link. Request a peer review via pull request and address comments before you finalise.',
        command:
          'git checkout -b soa-review\ngit add soa/soa.md policies/\ngit commit -m "Add SoA and core policies"\ngit push -u origin soa-review\n# Open a pull request and request one reviewer.',
      },
    ],
    rubric: [
      { id: 'cap-iso27001-r1', criterion: 'Scope is specific, bounded and justified', weight: 20, evidenceType: 'note' },
      { id: 'cap-iso27001-r2', criterion: 'All 93 Annex A controls addressed with justification', weight: 30, evidenceType: 'file' },
      { id: 'cap-iso27001-r3', criterion: 'Three core policies are complete and reviewed', weight: 25, evidenceType: 'file' },
      { id: 'cap-iso27001-r4', criterion: 'SoA committed with auditable Git history', weight: 25, evidenceType: 'url' },
    ],
  },
  {
    id: 'cap-risk-register',
    slug: 'enterprise-risk-register',
    title: 'Enterprise risk register & quantitative vulnerability mapping',
    objective:
      'Conduct a full risk assessment on a mock hybrid environment and populate an auditable risk register.',
    tools: ['Greenbone / OpenVAS', 'OWASP ZAP', 'Python (CVSS and Monte Carlo)'],
    setup:
      'Deploy a scan target you own. Run Greenbone or OpenVAS for infrastructure scanning and OWASP ZAP for web scanning against that target only. Never scan systems you do not have written permission to test.',
    deliverables: [
      'Imported vulnerability scan reports covering the hybrid environment',
      'A scored risk register using likelihood times impact',
      'Treatment decisions: mitigate, transfer, accept or avoid, with owners',
      'A set of Key Risk Indicators with thresholds and actions',
    ],
    difficulty: 'advanced',
    estHours: 9,
    steps: [
      {
        id: 'cap-risk-register-s1',
        title: 'Prepare an isolated scanning range',
        detail:
          'Create a controllable lab network so scans stay lawful and repeatable. Document the authorisation for the range before you scan.',
        command:
          'docker network create grc-lab\ndocker run -d --name zap --network grc-lab -p 8090:8090 \\\n  ghcr.io/zaproxy/zaproxy:stable zap-webswing.sh',
      },
      {
        id: 'cap-risk-register-s2',
        title: 'Run vulnerability scans',
        detail:
          'Run an infrastructure scan with OpenVAS and a web scan with ZAP against the authorised target. Export the findings as CSV or XML for the register.',
        command:
          '# OWASP ZAP baseline scan against an authorised target only\npython3 -m pip install --quiet zaproxy\nzap-baseline.py -t https://YOUR-AUTHORISED-TARGET -r zap-report.html',
      },
      {
        id: 'cap-risk-register-s3',
        title: 'Convert CVSS scores to risk',
        detail:
          'Script the conversion from CVSS base scores to likelihood and impact, then join with asset criticality to produce a risk score. Keep the mapping documented so it is reproducible.',
        command:
          'python3 - <<\'PY\'\n# Map CVSS base score (0-10) to a 1-5 likelihood/impact scale.\nrules = [(0,1),(3.9,2),(6.9,3),(8.9,4),(10.0,5)]\ndef band(cvss):\n    for ceiling, value in rules:\n        if cvss <= ceiling:\n            return value\n    return 5\nfor cvss, asset_crit in [(7.5, 5), (9.8, 4), (4.2, 3)]:\n    likelihood, impact = band(cvss), asset_crit\n    print(f"CVSS {cvss}: score {likelihood * impact}")\nPY',
      },
      {
        id: 'cap-risk-register-s4',
        title: 'Populate the risk register',
        detail:
          'For each material risk record: identifier, description, asset, threat, vulnerability, likelihood, impact, inherent score, treatment and owner. Export to CSV so it is auditable and diffable.',
      },
      {
        id: 'cap-risk-register-s5',
        title: 'Model uncertainty with Monte Carlo',
        detail:
          'Simulate annualised loss for your top risks to show a range rather than a single number. Report the median and the 95th percentile to inform appetite.',
        command:
          'python3 - <<\'PY\'\nimport random, statistics\n# Simple Monte Carlo annualised loss model (currency units).\ndef simulate(trials=10000, freq=0.3, loss_low=5e4, loss_high=5e5):\n    losses = [random.uniform(loss_low, loss_high)\n              for _ in range(trials) if random.random() < freq]\n    return statistics.median(losses), sorted(losses)[int(0.95 * len(losses)) - 1]\nprint("median, p95 =", simulate())\nPY',
      },
      {
        id: 'cap-risk-register-s6',
        title: 'Define KRIs and thresholds',
        detail:
          'Choose indicators such as count of critical findings open over 30 days. Set green, amber and red thresholds with a defined action at amber and red. Store them with the register.',
      },
    ],
    rubric: [
      { id: 'cap-risk-register-r1', criterion: 'Authorised, reproducible scan range documented', weight: 15, evidenceType: 'note' },
      { id: 'cap-risk-register-r2', criterion: 'Scan reports imported for infrastructure and web', weight: 20, evidenceType: 'file' },
      { id: 'cap-risk-register-r3', criterion: 'Register scored with likelihood, impact and treatment', weight: 30, evidenceType: 'file' },
      { id: 'cap-risk-register-r4', criterion: 'KRIs defined with thresholds and actions', weight: 20, evidenceType: 'note' },
      { id: 'cap-risk-register-r5', criterion: 'Monte Carlo model is reproducible', weight: 15, evidenceType: 'file' },
    ],
  },
  {
    id: 'cap-nist-csf',
    slug: 'nist-csf-cloud-audit',
    title: 'NIST CSF 2.0 cloud compliance audit & gap analysis',
    objective:
      'Audit a cloud infrastructure deployment against NIST CSF 2.0 across Govern, Identify, Protect, Detect, Respond and Recover.',
    tools: ['Trivy / ScoutSuite', 'AWS Inspector or Defender for Cloud', 'NIST CSF 2.0 reference tool'],
    setup:
      'Use a dedicated sandbox cloud account so scans read real configuration without touching production. Grant read-only credentials to the scanning tool.',
    deliverables: [
      'Automated cloud compliance scan output',
      'A control evaluation matrix against CSF subcategories',
      'A formal audit finding report with root cause analysis',
      'A corrective action plan with owners and dates',
    ],
    difficulty: 'expert',
    estHours: 12,
    steps: [
      {
        id: 'cap-nist-csf-s1',
        title: 'Configure read-only cloud access',
        detail:
          'Create a read-only role in your sandbox account. Never use long-lived administrator keys. Record the scope of access as part of the audit evidence.',
      },
      {
        id: 'cap-nist-csf-s2',
        title: 'Run a configuration scan',
        detail:
          'Scan the cloud account configuration with ScoutSuite, or scan infrastructure as code with Trivy. Export the report to JSON and HTML for evidence.',
        command:
          'pip install --quiet scoutsuite\ntrivy config --format json ./terraform > trivy-config.json\nscout suite aws --report-dir ./scout-report || true',
      },
      {
        id: 'cap-nist-csf-s3',
        title: 'Build the CSF evaluation matrix',
        detail:
          'For each in-scope CSF 2.0 subcategory record the expected outcome, the evidence reviewed, the result, and the gap. Group by function for readability.',
      },
      {
        id: 'cap-nist-csf-s4',
        title: 'Write the audit finding report',
        detail:
          'For each finding state condition, criteria, cause, effect and recommendation. Include a root cause analysis that goes past the symptom to the process failure behind it.',
      },
      {
        id: 'cap-nist-csf-s5',
        title: 'Draft the corrective action plan',
        detail:
          'Convert each recommendation into actions with a named owner, a due date and a verification method. Link every action back to its finding.',
      },
    ],
    rubric: [
      { id: 'cap-nist-csf-r1', criterion: 'Read-only access and scope documented', weight: 15, evidenceType: 'note' },
      { id: 'cap-nist-csf-r2', criterion: 'Cloud config scan evidence attached', weight: 20, evidenceType: 'file' },
      { id: 'cap-nist-csf-r3', criterion: 'CSF subcategory matrix is complete', weight: 25, evidenceType: 'file' },
      { id: 'cap-nist-csf-r4', criterion: 'Finding report includes root cause analysis', weight: 25, evidenceType: 'file' },
      { id: 'cap-nist-csf-r5', criterion: 'CAP has owners, dates and verification', weight: 15, evidenceType: 'note' },
    ],
  },
  {
    id: 'cap-soc2-tprm',
    slug: 'soc2-evidence-tprm',
    title: 'SOC 2 Type II evidence collection & vendor risk assessment',
    objective:
      'Evaluate a third-party vendor security posture and assemble an auditor-ready SOC 2 evidence binder.',
    tools: ['Keycloak', 'Wireshark / Sysinternals', 'Markdown or PDF binder generator'],
    setup:
      'Stand up Keycloak for identity and access evidence, and capture host and network logs. Prepare a SIG questionnaire to issue to a mock SaaS vendor.',
    deliverables: [
      'A completed SIG questionnaire assessment of the vendor',
      'A Trust Services Criteria gap analysis',
      'Evidence binder with screenshots and logs, timestamped and attested',
      'A vendor risk rating with recommended treatment',
    ],
    difficulty: 'advanced',
    estHours: 9,
    steps: [
      {
        id: 'cap-soc2-tprm-s1',
        title: 'Launch the identity evidence source',
        detail:
          'Run Keycloak locally to produce authentication, session and access evidence you can screenshot with timestamps.',
        command:
          'docker run -d --name keycloak -p 8081:8080 \\\n  -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=change-me \\\n  quay.io/keycloak/keycloak:latest start-dev\n# Open http://localhost:8081 and create a test realm.',
      },
      {
        id: 'cap-soc2-tprm-s2',
        title: 'Assess the vendor with a SIG',
        detail:
          'Issue the SIG questionnaire to the mock vendor and score the responses. Identify unsupported claims that need follow-up evidence.',
      },
      {
        id: 'cap-soc2-tprm-s3',
        title: 'Run a Trust Services Criteria gap analysis',
        detail:
          'Map the vendor controls to the five TSC categories: security, availability, processing integrity, confidentiality and privacy. Record gaps and compensating controls.',
      },
      {
        id: 'cap-soc2-tprm-s4',
        title: 'Capture host and network evidence',
        detail:
          'Capture network and host evidence and store it with a timestamp and a hash so the auditor can trust it was not altered after collection.',
        command:
          'sha256sum evidence/*.log > evidence/manifest.sha256\ndate -u +%Y-%m-%dT%H:%M:%SZ | tee evidence/collected-at.txt',
      },
      {
        id: 'cap-soc2-tprm-s5',
        title: 'Assemble the evidence binder',
        detail:
          'Build a single binder with a contents index, each piece of evidence, its criteria reference, its timestamp and your attestation statement. Export to PDF and store the markdown source.',
      },
    ],
    rubric: [
      { id: 'cap-soc2-tprm-r1', criterion: 'SIG assessment completed and scored', weight: 25, evidenceType: 'file' },
      { id: 'cap-soc2-tprm-r2', criterion: 'TSC gap analysis across all five categories', weight: 25, evidenceType: 'file' },
      { id: 'cap-soc2-tprm-r3', criterion: 'Evidence timestamped and hash-manifested', weight: 25, evidenceType: 'file' },
      { id: 'cap-soc2-tprm-r4', criterion: 'Vendor rating and treatment recommendation', weight: 25, evidenceType: 'note' },
    ],
  },
];

export const CAPSTONES_BY_ID = Object.fromEntries(
  CAPSTONE_PROJECTS.map((p) => [p.id, p]),
);

export function rubricTotal(project: CapstoneProject): number {
  return project.rubric.reduce((sum, c) => sum + c.weight, 0);
}
