import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TRACKS } from '@/lib/content/tracks';
import { TrackDetail } from './track-detail';

export function generateStaticParams() {
  return TRACKS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = TRACKS.find((t) => t.slug === slug);
  return { title: track?.title ?? 'Track' };
}

export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = TRACKS.find((t) => t.slug === slug);
  if (!track) notFound();

  return (
    <div className="space-y-4">
      <Link href="/tracks" className="text-sm font-semibold text-brand-600 dark:text-brand-300">
        ← All tracks
      </Link>
      <TrackDetail track={track} />
    </div>
  );
}
