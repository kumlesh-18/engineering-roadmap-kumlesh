import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RoadmapClientPage } from '@/components/roadmap/roadmap-client-page';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: `Interactive roadmap for ${slug}. Learn with AI tutoring, quizzes, and knowledge graphs.`,
  };
}

export default async function RoadmapPage({ params }: PageProps) {
  const { slug } = await params;
  return <RoadmapClientPage slug={slug} />;
}