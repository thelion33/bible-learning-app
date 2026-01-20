import { BookOpen, Youtube, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#001f3f] via-[#003366] to-[#001f3f] text-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Revival Today
              <span className="block mt-2">Bible Learning</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 text-gray-200 leading-relaxed max-w-3xl mx-auto">
              Transform church sermons into engaging, gamified learning experiences
              for spiritual growth and knowledge retention.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="text-base px-8 py-6 bg-[#003366] hover:bg-[#004080] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/lessons">
                <Button size="lg" className="text-base px-8 py-6 border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#001f3f] font-semibold transition-all">
                  Browse Lessons
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Youtube className="w-12 h-12 text-[#003366]" />}
              title="Auto-Sync Videos"
              description="Automatically scans Revival Today Church YouTube channel hourly for new sermons"
            />
            <FeatureCard
              icon={<Sparkles className="w-12 h-12 text-[#003366]" />}
              title="AI-Powered Content"
              description="Uses OpenAI to generate summaries, key points, and custom learning questions"
            />
            <FeatureCard
              icon={<BookOpen className="w-12 h-12 text-[#003366]" />}
              title="Duolingo-Style Learning"
              description="Engaging question types: multiple choice, fill-in-blank, scripture matching"
            />
            <FeatureCard
              icon={<Trophy className="w-12 h-12 text-[#003366]" />}
              title="Track Progress"
              description="Earn XP, maintain streaks, and unlock new lessons as you grow"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Join us in transforming sermon content into actionable spiritual learning.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="text-base px-10 py-6 bg-[#003366] hover:bg-[#004080] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
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
    <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="mb-6 flex justify-center">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">{title}</h3>
      <p className="text-gray-600 text-center leading-relaxed text-sm">{description}</p>
    </div>
  );
}
