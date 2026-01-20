import { BookOpen, Youtube, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold uppercase mb-6 tracking-tight">
              Revival Today
              <span className="block text-yellow-400">Bible Learning</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 leading-relaxed">
              Transform church sermons into engaging, gamified learning experiences
              for spiritual growth and knowledge retention.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-10 py-7 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold uppercase tracking-wide shadow-xl hover:shadow-2xl transition-all">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/lessons">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-white text-white hover:bg-white hover:text-blue-900 font-bold uppercase tracking-wide">
                  Browse Lessons
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 uppercase mb-12 tracking-wide">
            How It Works
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Youtube className="w-12 h-12 text-blue-900" />}
              title="Auto-Sync Videos"
              description="Automatically scans Revival Today Church YouTube channel hourly for new sermons"
            />
            <FeatureCard
              icon={<Sparkles className="w-12 h-12 text-blue-900" />}
              title="AI-Powered Content"
              description="Uses OpenAI to generate summaries, key points, and custom learning questions"
            />
            <FeatureCard
              icon={<BookOpen className="w-12 h-12 text-blue-900" />}
              title="Duolingo-Style Learning"
              description="Engaging question types: multiple choice, fill-in-blank, scripture matching"
            />
            <FeatureCard
              icon={<Trophy className="w-12 h-12 text-blue-900" />}
              title="Track Progress"
              description="Earn XP, maintain streaks, and unlock new lessons as you grow"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold uppercase mb-6 tracking-wide">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join us in transforming sermon content into actionable spiritual learning.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-12 py-7 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold uppercase tracking-wide shadow-xl hover:shadow-2xl transition-all">
                Create Your Free Account
              </Button>
            </Link>
          </div>
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
    <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all hover:-translate-y-1 border-t-4 border-yellow-500">
      <div className="mb-6 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide text-center">{title}</h3>
      <p className="text-gray-600 text-center leading-relaxed">{description}</p>
    </div>
  );
}
