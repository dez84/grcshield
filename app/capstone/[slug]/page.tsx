import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CAPSTONE_PROJECTS } from '@/lib/content/capstones';
import { CapstoneWorkspace } from './capstone-workspace';

export function generateStaticParams() {
  return CAPSTONE_PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = CAPSTONE_PROJECTS.find((p) => p.slug === slug);
  return { title: project?.title ?? 'Capstone project' };
}

export default async function CapstoneProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = CAPSTONE_PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div className="space-y-4">
      <Link href="/capstone" className="text-sm font-semibold text-brand-600 dark:text-brand-300">
        ← Capstone Lab Hub
      </Link>
      <CapstoneWorkspace project={project} />
    </div>
  );
}
