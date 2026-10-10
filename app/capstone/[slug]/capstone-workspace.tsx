'use client';

import { useMemo, useState } from 'react';
import { useProgress } from '@/components/progress-provider';
import { Badge, CopyButton, ProgressBar, ProgressRing } from '@/components/ui';
import { evaluateCapstone } from '@/lib/evaluate';
import { rubricTotal, type CapstoneProject } from '@/lib/content/capstones';

function StepCommand({ command }: { command: string }) {
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Command</span>
        <CopyButton text={command} />
      </div>
      <pre className="overflow-x-auto bg-shield-ink px-3 py-2 text-xs leading-relaxed text-slate-100">
        <code>{command}</code>
      </pre>
    </div>
  );
}

export function CapstoneWorkspace({ project }: { project: CapstoneProject }) {
  const { capstoneSteps, evidence, setStep, addEvidence, email, loading } = useProgress();
  const [tab, setTab] = useState<'steps' | 'evidence' | 'rubric'>('steps');

  const evaluation = useMemo(
    () => evaluateCapstone(project, capstoneSteps, evidence),
    [project, capstoneSteps, evidence],
  );

  const stepDone = (stepId: string) => capstoneSteps.find((s) => s.stepId === stepId)?.complete ?? false;
  const projectEvidence = evidence.filter((e) => e.projectId === project.id);

  return (
    <div className="space-y-5">
      <header className="shield-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={project.difficulty === 'expert' ? 'rose' : project.difficulty === 'advanced' ? 'amber' : 'brand'}>
                {project.difficulty}
              </Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {project.steps.length} steps · {project.estHours}h · {rubricTotal(project)} rubric points
              </span>
              {evaluation.passed && <Badge tone="emerald">Passed</Badge>}
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight">{project.title}</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{project.objective}</p>
          </div>
          <ProgressRing value={evaluation.rubricScore} size={72} />
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Recommended tools</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {project.tools.map((tool) => (
                <span key={tool} className="pill bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">{tool}</span>
              ))}
            </dd>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Setup requirements</dt>
            <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">{project.setup}</dd>
          </div>
        </dl>

        <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-900 dark:bg-brand-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">Deliverables</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-700 dark:text-slate-200">
            {project.deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Project sections">
        {([
          ['steps', `Steps (${evaluation.stepCompletion}%)`],
          ['evidence', `Evidence (${projectEvidence.length})`],
          ['rubric', `Rubric (${evaluation.rubricScore}%)`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            type="button"
            onClick={() => setTab(key)}
            className={`min-h-tap whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium ${
              tab === key
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-200'
                : 'border-slate-200 hover:border-brand-400 dark:border-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'steps' && (
        <ol className="space-y-3">
          {project.steps.map((step, i) => (
            <li key={step.id} className="shield-card">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-6 w-6 shrink-0 rounded-md border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-white/20"
                  checked={stepDone(step.id)}
                  disabled={loading}
                  onChange={(e) => void setStep(project.id, step.id, e.target.checked)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {i + 1}
                    </span>
                    <span className={`font-semibold ${stepDone(step.id) ? 'line-through opacity-60' : ''}`}>{step.title}</span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step.detail}</span>
                  {step.command && <StepCommand command={step.command} />}
                </span>
              </label>
            </li>
          ))}
        </ol>
      )}

      {tab === 'evidence' && (
        <EvidencePanel
          project={project}
          email={email}
          defaultAttestation={email ?? ''}
          onAdd={addEvidence}
          evidence={projectEvidence}
        />
      )}

      {tab === 'rubric' && (
        <section className="shield-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Auto-evaluated rubric</h2>
            <Badge tone={evaluation.passed ? 'emerald' : 'amber'}>
              {evaluation.passed ? 'Pass' : `Needs ${Math.max(0, 80 - evaluation.rubricScore)}% more`}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            A criterion is satisfied when at least one piece of evidence is linked to it. Pass needs 80% rubric and
            80% checklist.
          </p>
          <ul className="mt-3 space-y-3">
            {evaluation.criteria.map((c) => (
              <li key={c.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{c.criterion}</p>
                  <Badge tone={c.satisfied ? 'emerald' : 'slate'}>{c.weight} pts</Badge>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <ProgressBar value={c.satisfied ? 100 : 0} className="flex-1" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {c.satisfied ? `${c.evidenceCount} item${c.evidenceCount > 1 ? 's' : ''}` : 'No evidence yet'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <span className="text-sm font-semibold">Checklist completion</span>
            <span className="text-sm font-semibold">{evaluation.stepCompletion}%</span>
          </div>
        </section>
      )}
    </div>
  );
}

function EvidencePanel({
  project,
  email,
  defaultAttestation,
  evidence,
  onAdd,
}: {
  project: CapstoneProject;
  email: string | null;
  defaultAttestation: string;
  evidence: ReturnType<typeof useProgress>['evidence'];
  onAdd: ReturnType<typeof useProgress>['addEvidence'];
}) {
  const [criterionId, setCriterionId] = useState(project.rubric[0]?.id ?? '');
  const [kind, setKind] = useState<'note' | 'file' | 'url'>('note');
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [attestedBy, setAttestedBy] = useState(defaultAttestation);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const selectedCriterion = project.rubric.find((c) => c.id === criterionId);

  async function submit() {
    setPending(true);
    setError(null);
    setStatus(null);
    const result = await onAdd({
      projectId: project.id,
      criterionId,
      evidenceKind: kind,
      note: kind === 'note' ? note : note || `Evidence for ${selectedCriterion?.criterion ?? 'criterion'}`,
      url: kind === 'url' ? url : undefined,
      fileName: kind === 'file' ? file?.name : undefined,
      fileSize: kind === 'file' ? file?.size : undefined,
      attestedBy: attestedBy || undefined,
    });
    if (result.error) {
      setError(result.error);
    } else {
      setStatus('Evidence recorded and rubric updated.');
      setNote('');
      setUrl('');
      setFile(null);
    }
    setPending(false);
  }

  return (
    <div className="space-y-4">
      <form
        className="shield-card space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <h2 className="text-base font-bold">Submit evidence</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Attach a note, a link or a file to a rubric criterion. Each submission is timestamped and attested.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Rubric criterion</span>
            <select className="field" value={criterionId} onChange={(e) => setCriterionId(e.target.value)}>
              {project.rubric.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.criterion} ({c.weight} pts)
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Evidence type</span>
            <select className="field" value={kind} onChange={(e) => setKind(e.target.value as 'note' | 'file' | 'url')}>
              <option value="note">Note or written summary</option>
              <option value="url">Repository or artifact link</option>
              <option value="file">File upload reference</option>
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Description</span>
          <textarea
            rows={3}
            className="field resize-y"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you produce and where does it live?"
          />
        </label>

        {kind === 'url' && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Evidence URL</span>
            <input
              type="url"
              className="field"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/you/isms-soa/pull/1"
            />
          </label>
        )}

        {kind === 'file' && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Evidence file</span>
            <input
              type="file"
              className="field"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
              No upload endpoint is provisioned in this build, so the file name and size are recorded as evidence
              metadata.
            </span>
          </label>
        )}

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Attested by {email ? `(${email})` : ''}</span>
          <input
            type="text"
            className="field"
            value={attestedBy}
            onChange={(e) => setAttestedBy(e.target.value)}
            placeholder="Your name or email"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary" disabled={pending || !criterionId}>
            {pending ? 'Recording…' : 'Record evidence'}
          </button>
          {status && <span className="text-sm text-emerald-600 dark:text-emerald-300">{status}</span>}
          {error && <span className="text-sm text-rose-600 dark:text-rose-300">{error}</span>}
        </div>
      </form>

      <section className="shield-card">
        <h2 className="text-base font-bold">Evidence binder</h2>
        {evidence.length === 0 ? (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No evidence recorded yet. Submissions appear here with their timestamp and attestation.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {evidence.map((item) => {
              const criterion = project.rubric.find((c) => c.id === item.criterionId);
              return (
                <li key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{item.evidenceKind}</Badge>
                    {criterion && <span className="text-xs text-slate-500 dark:text-slate-400">{criterion.criterion}</span>}
                  </div>
                  <p className="mt-1 text-sm">{item.note || '(no description)'}</p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-1 block break-all text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
                    >
                      {item.url}
                    </a>
                  )}
                  {item.fileName && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      File: {item.fileName}
                      {item.fileSize ? ` (${Math.round(item.fileSize / 1024)} KB)` : ''}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                    {item.attestedBy ? ` · attested by ${item.attestedBy}` : ''}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
