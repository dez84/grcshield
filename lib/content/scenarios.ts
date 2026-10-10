export type OptionQuality = 'best' | 'ok' | 'poor' | 'breach';

export interface ScenarioOption {
  id: string;
  label: string;
  feedback: string;
  scoreDelta: number;
  quality: OptionQuality;
  nextNodeId?: string;
}

export interface ScenarioNode {
  id: string;
  prompt: string;
  isTerminal: boolean;
  debrief?: string;
  options: ScenarioOption[];
}

export interface Scenario {
  id: string;
  title: string;
  briefing: string;
  roleHint: string;
  rootNodeId: string;
  nodes: ScenarioNode[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'scn-board-pack',
    title: 'The quarterly board pack',
    briefing:
      'It is two days before the audit committee meeting. A critical vulnerability has sat unpatched for 45 days because the owning team calls the fix "too disruptive". The CFO wants to delay reporting it until it is fixed so the pack looks clean.',
    roleHint: 'GRC Lead',
    rootNodeId: 'bp-1',
    nodes: [
      {
        id: 'bp-1',
        prompt: 'The CFO asks you to leave the overdue vulnerability out of the pack. What do you do?',
        isTerminal: false,
        options: [
          {
            id: 'bp-1-a',
            label: 'Report the vulnerability with its current status and planned fix date',
            feedback:
              'Correct. Board reporting must reflect reality. State the exposure, the action and the date, and let the committee govern.',
            scoreDelta: 10,
            quality: 'best',
            nextNodeId: 'bp-2',
          },
          {
            id: 'bp-1-b',
            label: 'Omit it as requested to keep the pack clean',
            feedback:
              'This is a breach of integrity. Concealing a known exposure from the board undermines the entire governance chain and is a reportable conduct issue.',
            scoreDelta: -15,
            quality: 'breach',
            nextNodeId: 'bp-2',
          },
          {
            id: 'bp-1-c',
            label: 'Mention it only in an appendix no one reads',
            feedback:
              'Burying a material item avoids direct conflict but still misleads. Material risks belong in the main body with context.',
            scoreDelta: 2,
            quality: 'poor',
            nextNodeId: 'bp-2',
          },
        ],
      },
      {
        id: 'bp-2',
        prompt: 'You now must frame the item. How do you present it?',
        isTerminal: false,
        options: [
          {
            id: 'bp-2-a',
            label: 'Against risk appetite, with the decision needed from the board',
            feedback:
              'Exactly. Boards want the appetite position, the top exposures and the decision required. This turns a status update into governance.',
            scoreDelta: 10,
            quality: 'best',
            nextNodeId: 'bp-3',
          },
          {
            id: 'bp-2-b',
            label: 'As a raw list of open vulnerability counts',
            feedback:
              'Counts alone lack context. Without appetite and decisions, the board cannot act, and the item gets deferred again.',
            scoreDelta: 3,
            quality: 'ok',
            nextNodeId: 'bp-3',
          },
          {
            id: 'bp-2-c',
            label: 'Blame the owning team for the delay',
            feedback:
              'Blame invites defensiveness and hides the systemic cause. Focus on the risk and the decision, not on individuals.',
            scoreDelta: -5,
            quality: 'poor',
            nextNodeId: 'bp-3',
          },
        ],
      },
      {
        id: 'bp-3',
        prompt: 'The board asks what will stop this recurring. Your answer?',
        isTerminal: true,
        debrief:
          'You handled the conflict with integrity and framed the issue for governance. The durable fix is a measurable escalation path: an unpatched critical finding past its threshold automatically escalates to the risk committee with a named owner and date.',
        options: [
          {
            id: 'bp-3-a',
            label: 'Propose an automatic escalation path with thresholds and owners',
            feedback:
              'Strong. Systemic fixes with thresholds and owners prevent the same exception becoming routine.',
            scoreDelta: 10,
            quality: 'best',
          },
          {
            id: 'bp-3-b',
            label: 'Promise to work harder next quarter',
            feedback:
              'Goodwill is not a control. Without a mechanism, the same delay recurs and no one can measure improvement.',
            scoreDelta: 0,
            quality: 'poor',
          },
        ],
      },
    ],
  },
  {
    id: 'scn-cloud-migration',
    title: 'The rushed cloud migration',
    briefing:
      'A business unit is migrating a customer database to a public cloud in three weeks to hit a product launch. The architecture includes a public storage bucket, a shared administrator account, and no data classification. You are the risk lead asked to sign off.',
    roleHint: 'Risk Manager',
    rootNodeId: 'cm-1',
    nodes: [
      {
        id: 'cm-1',
        prompt: 'What is your first move?',
        isTerminal: false,
        options: [
          {
            id: 'cm-1-a',
            label: 'Perform a rapid risk assessment with the business unit',
            feedback:
              'Right. A time-boxed assessment surfaces the real exposures and gives you facts for the decision.',
            scoreDelta: 10,
            quality: 'best',
            nextNodeId: 'cm-2',
          },
          {
            id: 'cm-1-b',
            label: 'Refuse the launch outright',
            feedback:
              'A blanket refusal without analysis makes risk the enemy of delivery and will be overridden. Assess, then advise.',
            scoreDelta: -5,
            quality: 'poor',
            nextNodeId: 'cm-2',
          },
          {
            id: 'cm-1-c',
            label: 'Sign off now and document later',
            feedback:
              'Signing off before assessment means accepting unknown risk. This is precisely the failure auditors look for.',
            scoreDelta: -15,
            quality: 'breach',
            nextNodeId: 'cm-2',
          },
        ],
      },
      {
        id: 'cm-2',
        prompt: 'The assessment finds the public storage bucket and a shared admin account. What now?',
        isTerminal: false,
        options: [
          {
            id: 'cm-2-a',
            label: 'Require the bucket be private and the admin account replaced with named, least-privilege roles',
            feedback:
              'Correct. These are non-negotiable baseline controls. Fix them before launch, not after.',
            scoreDelta: 10,
            quality: 'best',
            nextNodeId: 'cm-3',
          },
          {
            id: 'cm-2-b',
            label: 'Accept the shared account temporarily and log it as a risk',
            feedback:
              'Shared administrator accounts destroy accountability. Logging it does not make it acceptable for regulated data.',
            scoreDelta: -8,
            quality: 'poor',
            nextNodeId: 'cm-3',
          },
          {
            id: 'cm-2-c',
            label: 'Ask the vendor to fix it after launch',
            feedback:
              'Late fixes expose the data during the highest-risk window and rarely happen on schedule.',
            scoreDelta: -10,
            quality: 'poor',
            nextNodeId: 'cm-3',
          },
        ],
      },
      {
        id: 'cm-3',
        prompt: 'Leadership asks how you will make the launch decision auditable. Your answer?',
        isTerminal: true,
        debrief:
          'You ran a time-boxed assessment, enforced baseline controls and framed the decision. A risk register entry with the treatment, owner, residual score and a review date makes the decision defensible.',
        options: [
          {
            id: 'cm-3-a',
            label: 'Record the risk, treatment, residual score and review date in the register',
            feedback:
              'Strong. This is the auditable trail that shows a considered decision rather than an accident.',
            scoreDelta: 10,
            quality: 'best',
          },
          {
            id: 'cm-3-b',
            label: 'Keep the decision in email threads',
            feedback:
              'Email is not a register. Scattered decisions cannot be reported against appetite or reviewed.',
            scoreDelta: -3,
            quality: 'poor',
          },
        ],
      },
    ],
  },
  {
    id: 'scn-dsar',
    title: 'The data subject request',
    briefing:
      'A customer emails asking for a copy of all personal data you hold about them and for deletion of what is no longer needed under GDPR. Their data sits across a CRM, a marketing tool, a support system and a data warehouse. A 30-day clock has started.',
    roleHint: 'Privacy Compliance Officer',
    rootNodeId: 'ds-1',
    nodes: [
      {
        id: 'ds-1',
        prompt: 'How do you begin?',
        isTerminal: false,
        options: [
          {
            id: 'ds-1-a',
            label: 'Verify identity, log the request and start the 30-day clock',
            feedback:
              'Correct. Verification protects against disclosure to the wrong person, and logging starts the auditable timeline.',
            scoreDelta: 10,
            quality: 'best',
            nextNodeId: 'ds-2',
          },
          {
            id: 'ds-1-b',
            label: 'Immediately send everything you find',
            feedback:
              'Disclosing personal data without verifying identity can itself be a breach. Verify first.',
            scoreDelta: -8,
            quality: 'poor',
            nextNodeId: 'ds-2',
          },
          {
            id: 'ds-1-c',
            label: 'Reply that the request is too broad',
            feedback:
              'You may clarify scope, but you cannot refuse simply because it is broad. The clock is still running.',
            scoreDelta: -5,
            quality: 'poor',
            nextNodeId: 'ds-2',
          },
        ],
      },
      {
        id: 'ds-2',
        prompt: 'You find data in all four systems plus backups. What is your approach?',
        isTerminal: false,
        options: [
          {
            id: 'ds-2-a',
            label: 'Coordinate all system owners, apply retention rules to deletion, and document what is lawful to keep',
            feedback:
              'Correct. Deletion has to respect legal retention duties, and coordination prevents partial answers.',
            scoreDelta: 10,
            quality: 'best',
            nextNodeId: 'ds-3',
          },
          {
            id: 'ds-2-b',
            label: 'Delete everything everywhere including legally required records',
            feedback:
              'Over-deletion breaks other legal duties. Deletion must be weighed against retention obligations.',
            scoreDelta: -8,
            quality: 'poor',
            nextNodeId: 'ds-3',
          },
          {
            id: 'ds-2-c',
            label: 'Handle the CRM only and call it done',
            feedback:
              'Partial responses breach the right of access. All systems holding the data must be in scope.',
            scoreDelta: -10,
            quality: 'poor',
            nextNodeId: 'ds-3',
          },
        ],
      },
      {
        id: 'ds-3',
        prompt: 'The deadline approaches. What do you deliver?',
        isTerminal: true,
        debrief:
          'You verified, coordinated and documented. A clear response stating what was provided, what was deleted, what was retained and why, within the deadline, is defensible to the regulator.',
        options: [
          {
            id: 'ds-3-a',
            label: 'Provide the data and a clear record of deletions and lawful retentions within the deadline',
            feedback:
              'Strong. Transparency plus a documented rationale is exactly what regulators expect.',
            scoreDelta: 10,
            quality: 'best',
          },
          {
            id: 'ds-3-b',
            label: 'Let the deadline pass and explain later',
            feedback:
              'Missing the deadline is a compliance failure regardless of the reason. Escalate early if you need an extension.',
            scoreDelta: -12,
            quality: 'breach',
          },
        ],
      },
    ],
  },
  {
    id: 'scn-audit-finding',
    title: 'The disputed audit finding',
    briefing:
      'During fieldwork you sampled 40 change records and found 6 deployed without approval. Management disputes the finding, arguing the changes were low risk and that the sample was unfair. You are the audit lead drafting the report.',
    roleHint: 'IT Audit Lead',
    rootNodeId: 'af-1',
    nodes: [
      {
        id: 'af-1',
        prompt: 'Management challenges the finding. How do you respond?',
        isTerminal: false,
        options: [
          {
            id: 'af-1-a',
            label: 'Re-explain the criteria, the population and the sampling method, and invite evidence to the contrary',
            feedback:
              'Correct. The finding rests on criteria and evidence. Let management supply evidence if they disagree.',
            scoreDelta: 10,
            quality: 'best',
            nextNodeId: 'af-2',
          },
          {
            id: 'af-1-b',
            label: 'Drop the finding to keep the relationship friendly',
            feedback:
              'Dropping a supported finding under pressure destroys audit independence and credibility.',
            scoreDelta: -12,
            quality: 'breach',
            nextNodeId: 'af-2',
          },
          {
            id: 'af-1-c',
            label: 'Escalate immediately to the audit committee without discussion',
            feedback:
              'Escalation without giving management a fair chance to respond is premature. Discuss first.',
            scoreDelta: 0,
            quality: 'poor',
            nextNodeId: 'af-2',
          },
        ],
      },
      {
        id: 'af-2',
        prompt: 'Management concedes the changes lacked approval but says process was unclear. What root cause do you record?',
        isTerminal: false,
        options: [
          {
            id: 'af-2-a',
            label: 'Process and awareness failure: approval path was undefined and untrained',
            feedback:
              'Correct. A root cause that goes past "people made mistakes" drives a fix that lasts.',
            scoreDelta: 10,
            quality: 'best',
            nextNodeId: 'af-3',
          },
          {
            id: 'af-2-b',
            label: 'Individual carelessness',
            feedback:
              'Blaming individuals misses the systemic cause and the finding will recur with the next person.',
            scoreDelta: -5,
            quality: 'poor',
            nextNodeId: 'af-3',
          },
          {
            id: 'af-2-c',
            label: 'No root cause needed, just note the exceptions',
            feedback:
              'A finding without a root cause cannot be remediated properly. The CAP becomes guesswork.',
            scoreDelta: -4,
            quality: 'poor',
            nextNodeId: 'af-3',
          },
        ],
      },
      {
        id: 'af-3',
        prompt: 'You are writing the corrective action plan. What must it contain?',
        isTerminal: true,
        debrief:
          'You held the finding, drew on evidence, and found a systemic cause. A CAP with defined approval steps, training, a named owner, a due date and a verification test closes the loop.',
        options: [
          {
            id: 'af-3-a',
            label: 'Defined approval path, training, a named owner, a due date and a later verification test',
            feedback:
              'Strong. Owner, date and verification are what turn a recommendation into a closed action.',
            scoreDelta: 10,
            quality: 'best',
          },
          {
            id: 'af-3-b',
            label: 'A general commitment to improve change management',
            feedback:
              'Vague commitments cannot be verified and usually stay open for years.',
            scoreDelta: -3,
            quality: 'poor',
          },
        ],
      },
    ],
  },
];

export const SCENARIOS_BY_ID = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));

export function scenarioMaxScore(scenario: Scenario): number {
  return scenario.nodes.reduce(
    (sum, node) => sum + Math.max(...node.options.map((o) => o.scoreDelta), 0),
    0,
  );
}
