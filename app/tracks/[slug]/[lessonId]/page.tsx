import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TRACKS } from '@/lib/content/tracks';
import { SCENARIOS } from '@/lib/content/scenarios';
import { QUIZZES } from '@/lib/content/quizzes';
import { LessonView } from './lesson-view';

export function generateStaticParams() {
  return TRACKS.flatMap((t) =>
    t.modules.flatMap((m) => m.lessons.map((l) => ({ slug: t.slug, lessonId: l.id }))),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params;
  const track = TRACKS.find((t) => t.slug === slug);
  const lesson = track?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  return { title: lesson?.title ?? 'Lesson' };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params;
  const track = TRACKS.find((t) => t.slug === slug);
  const lesson = track?.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  if (!track || !lesson) notFound();

  const scenario = lesson.activityId ? SCENARIOS.find((s) => s.id === lesson.activityId) ?? null : null;
  const quiz = lesson.activityId ? QUIZZES.find((q) => q.id === lesson.activityId) ?? null : null;

  return (
    <div className="space-y-4">
      <Link href={`/tracks/${track.slug}`} className="text-sm font-semibold text-brand-600 dark:text-brand-300">
        ← {track.title}
      </Link>
      <LessonView track={track} lesson={lesson} scenario={scenario} quiz={quiz} />
    </div>
  );
}
