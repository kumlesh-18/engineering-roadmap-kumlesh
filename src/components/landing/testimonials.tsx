'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'ML Engineer at Google',
    content: 'This roadmap gave me the structured path I needed to transition from traditional ML to LLMs. The AI tutor saved me weeks of research.',
    avatar: 'SC',
  },
  {
    name: 'Marcus Johnson',
    role: 'Software Engineer',
    content: 'The knowledge graph visualization helped me see how all the concepts connect. I finally understand where RAG fits in the bigger picture.',
    avatar: 'MJ',
  },
  {
    name: 'Priya Patel',
    role: 'AI Researcher',
    content: 'Quizzes with spaced repetition actually work. I retain concepts much better than just reading tutorials. The projects are production-quality.',
    avatar: 'PP',
  },
  {
    name: 'Alex Rivera',
    role: 'Startup Founder',
    content: 'Built our first RAG-powered feature following the roadmap. The MLOps section saved us from costly deployment mistakes.',
    avatar: 'AR',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by <span className="text-primary">engineers worldwide</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers mastering AI engineering with our structured approach.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="h-full">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.avatar}`} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}