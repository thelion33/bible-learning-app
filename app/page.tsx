import { BookOpen, Youtube, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Revival Today Bible Learning
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Transform church sermons into engaging, gamified learning experiences
            for spiritual growth and knowledge retention.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started Free
              </Button>
            </Link>
            <Link href="/lessons">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Browse Lessons
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          <FeatureCard
            icon={<Youtube className="w-8 h-8 text-purple-600" />}
            title="Auto-Sync Videos"
            description="Automatically scans Revival Today Church YouTube channel hourly for new sermons"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8 text-purple-600" />}
            title="AI-Powered Content"
            description="Uses OpenAI to generate summaries, key points, and custom learning questions"
          />
          <FeatureCard
            icon={<BookOpen className="w-8 h-8 text-purple-600" />}
            title="Duolingo-Style Learning"
            description="Engaging question types: multiple choice, fill-in-blank, scripture matching"
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8 text-purple-600" />}
            title="Track Progress"
            description="Earn XP, maintain streaks, and unlock new lessons as you grow"
          />
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-600 mb-6">
            Join us in transforming sermon content into actionable spiritual learning.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-12 py-6">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
