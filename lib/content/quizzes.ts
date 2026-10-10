export interface QuizOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  explanation: string;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export const QUIZZES: Quiz[] = [
  {
    id: 'quiz-gov-1',
    title: 'Governance foundations',
    questions: [
      {
        id: 'qg1-q1',
        prompt: 'Which line provides independent assurance to the board?',
        explanation:
          'The third line, internal audit, gives independent assurance. The first line owns risk and the second line oversees it.',
        options: [
          { id: 'qg1-q1-a', label: 'The first line', isCorrect: false },
          { id: 'qg1-q1-b', label: 'The second line', isCorrect: false },
          { id: 'qg1-q1-c', label: 'The third line', isCorrect: true },
        ],
      },
      {
        id: 'qg1-q2',
        prompt: 'What best describes risk appetite?',
        explanation:
          'Risk appetite is the amount and type of risk an organisation is willing to accept to pursue its objectives, expressed in measurable terms.',
        options: [
          { id: 'qg1-q2-a', label: 'A list of all known risks', isCorrect: false },
          { id: 'qg1-q2-b', label: 'The level of risk the organisation will accept to meet objectives', isCorrect: true },
          { id: 'qg1-q2-c', label: 'The insurance coverage limit', isCorrect: false },
        ],
      },
      {
        id: 'qg1-q3',
        prompt: 'Which document states step-by-step instructions?',
        explanation:
          'A procedure gives step-by-step instructions. A policy states intent, a standard states mandatory requirements and a baseline is the minimum configuration.',
        options: [
          { id: 'qg1-q3-a', label: 'Policy', isCorrect: false },
          { id: 'qg1-q3-b', label: 'Standard', isCorrect: false },
          { id: 'qg1-q3-c', label: 'Procedure', isCorrect: true },
        ],
      },
    ],
  },
  {
    id: 'quiz-risk-1',
    title: 'Risk analysis and treatment',
    questions: [
      {
        id: 'qr1-q1',
        prompt: 'Buying cyber insurance is which risk response?',
        explanation:
          'Insurance transfers financial exposure to another party, so it is transfer. Acceptance retains risk and mitigation reduces it.',
        options: [
          { id: 'qr1-q1-a', label: 'Mitigate', isCorrect: false },
          { id: 'qr1-q1-b', label: 'Transfer', isCorrect: true },
          { id: 'qr1-q1-c', label: 'Avoid', isCorrect: false },
        ],
      },
      {
        id: 'qr1-q2',
        prompt: 'Which is a Key Risk Indicator?',
        explanation:
          'A KRI measures risk exposure, such as critical vulnerabilities open over 30 days. Patch rate is a performance measure, a KPI.',
        options: [
          { id: 'qr1-q2-a', label: 'Percentage of patches applied on time', isCorrect: false },
          { id: 'qr1-q2-b', label: 'Number of critical vulnerabilities open over 30 days', isCorrect: true },
          { id: 'qr1-q2-c', label: 'Staff headcount', isCorrect: false },
        ],
      },
      {
        id: 'qr1-q3',
        prompt: 'What does a Business Impact Analysis primarily define?',
        explanation:
          'A BIA identifies critical processes and defines recovery objectives such as RTO and RPO.',
        options: [
          { id: 'qr1-q3-a', label: 'Recovery time and recovery point objectives', isCorrect: true },
          { id: 'qr1-q3-b', label: 'The annual security budget', isCorrect: false },
          { id: 'qr1-q3-c', label: 'The list of employees', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'quiz-comp-1',
    title: 'Framework matrix: controls to functions',
    questions: [
      {
        id: 'qc1-q1',
        prompt: 'Security awareness training maps most directly to which CSF function?',
        explanation:
          'Awareness and training is part of Protect, which covers safeguards such as training, access control and data security.',
        options: [
          { id: 'qc1-q1-a', label: 'Govern', isCorrect: false },
          { id: 'qc1-q1-b', label: 'Protect', isCorrect: true },
          { id: 'qc1-q1-c', label: 'Recover', isCorrect: false },
        ],
      },
      {
        id: 'qc1-q2',
        prompt: 'A documented risk appetite statement maps to which CSF function?',
        explanation:
          'Govern, new in CSF 2.0, covers strategy, roles, policy and risk management expectations.',
        options: [
          { id: 'qc1-q2-a', label: 'Govern', isCorrect: true },
          { id: 'qc1-q2-b', label: 'Detect', isCorrect: false },
          { id: 'qc1-q2-c', label: 'Respond', isCorrect: false },
        ],
      },
      {
        id: 'qc1-q3',
        prompt: 'SOC 2 Type II reports on which of the following?',
        explanation:
          'Type II reports on operating effectiveness of controls over a period. Type I reports on design at a point in time.',
        options: [
          { id: 'qc1-q3-a', label: 'Control design at a point in time', isCorrect: false },
          { id: 'qc1-q3-b', label: 'Operating effectiveness over a period', isCorrect: true },
          { id: 'qc1-q3-c', label: 'Only financial statements', isCorrect: false },
        ],
      },
      {
        id: 'qc1-q4',
        prompt: 'How many Annex A controls does ISO/IEC 27001:2022 contain?',
        explanation:
          'The 2022 revision restructured Annex A into 4 themes containing 93 controls.',
        options: [
          { id: 'qc1-q4-a', label: '114', isCorrect: false },
          { id: 'qc1-q4-b', label: '93', isCorrect: true },
          { id: 'qc1-q4-c', label: '20', isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 'quiz-audit-1',
    title: 'IT audit mastery',
    questions: [
      {
        id: 'qa1-q1',
        prompt: 'Testing whether a control worked throughout the period is testing what?',
        explanation:
          'Operating effectiveness tests whether the control functioned consistently across the period, unlike design effectiveness.',
        options: [
          { id: 'qa1-q1-a', label: 'Design effectiveness', isCorrect: false },
          { id: 'qa1-q1-b', label: 'Operating effectiveness', isCorrect: true },
          { id: 'qa1-q1-c', label: 'Control ownership', isCorrect: false },
        ],
      },
      {
        id: 'qa1-q2',
        prompt: 'Which elements belong in a well-formed audit finding?',
        explanation:
          'A finding states condition, criteria, cause, effect and recommendation. Owner and date belong to the corrective action plan.',
        options: [
          { id: 'qa1-q2-a', label: 'Condition, criteria, cause, effect, recommendation', isCorrect: true },
          { id: 'qa1-q2-b', label: 'Only the recommendation', isCorrect: false },
          { id: 'qa1-q2-c', label: 'A general opinion', isCorrect: false },
        ],
      },
      {
        id: 'qa1-q3',
        prompt: 'Who provides independent assurance rather than designing controls?',
        explanation:
          'Internal audit provides independent assurance. Designing controls would compromise that independence.',
        options: [
          { id: 'qa1-q3-a', label: 'The control owner', isCorrect: false },
          { id: 'qa1-q3-b', label: 'Internal audit', isCorrect: true },
          { id: 'qa1-q3-c', label: 'The vendor', isCorrect: false },
        ],
      },
    ],
  },
];

export const QUIZZES_BY_ID = Object.fromEntries(QUIZZES.map((q) => [q.id, q]));
