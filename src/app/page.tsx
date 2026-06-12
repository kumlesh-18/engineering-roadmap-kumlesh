import { Metadata } from 'next';
import { HeroSection } from '@/components/landing/hero';
import { FeaturesSection } from '@/components/landing/features';
import { RoadmapPreview } from '@/components/landing/roadmap-preview';
import { TestimonialsSection } from '@/components/landing/testimonials';
import { CTASection } from '@/components/landing/cta';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Learn AI Engineering Step by Step',
  description: 'Interactive roadmap to become an AI Engineer. Learn LLMs, RAG, Agents, MLOps, and more with AI tutoring, quizzes, and knowledge graphs.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <RoadmapPreview />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}