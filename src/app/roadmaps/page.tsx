import { Metadata } from 'next';
import { RoadmapsClientPage } from '@/components/roadmap/roadmaps-client-page';

export const metadata: Metadata = {
  title: 'Browse Roadmaps',
  description: 'Explore interactive learning roadmaps for AI Engineering and more.',
};

export default function RoadmapsPage() {
  return <RoadmapsClientPage />;
}