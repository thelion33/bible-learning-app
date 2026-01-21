import { BookOpen, Youtube, Trophy, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#001f3f] via-[#003366] to-[#001f3f] text-white py-12 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Revival Today
              <span className="block mt-1 sm:mt-2">Prosperity Academy</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 text-gray-200 leading-relaxed max-w-3xl mx-auto px-2">
              Transform church messages into engaging, gamified learning experiences
              for spiritual growth and knowledge retention.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 bg-[#003366] hover:bg-[#004080] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/lessons" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#001f3f] font-semibold transition-all">
                  Browse Lessons
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-10 sm:mb-12 md:mb-16">
            How It Works
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Youtube className="w-12 h-12 text-[#003366]" />}
              title="Auto-Sync Videos"
              description="Automatically scans Revival Today Church YouTube channel hourly for new messages"
            />
            <FeatureCard
              icon={<BookOpen className="w-12 h-12 text-[#003366]" />}
              title="Personalized Learning"
              description="Engaging question types tailored to each message and user"
            />
            <FeatureCard
              icon={<Trophy className="w-12 h-12 text-[#003366]" />}
              title="Track Progress"
              description="Earn XP, maintain streaks, and unlock new lessons as you grow"
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-[#003366]" />}
              title="Defend Your Faith"
              description="Chat with an AI powered pastor that will teach you to defend your faith and how to bring more followers to Christ"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-12 sm:py-16 md:py-20 border-t">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 leading-relaxed px-2">
              Join us in transforming message content into actionable spiritual learning.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="text-sm sm:text-base px-8 sm:px-10 py-5 sm:py-6 bg-[#003366] hover:bg-[#004080] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
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
