import { AuthSection } from "@/components/auth/AuthSection";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { EmergencyRequestForm } from "@/components/landing/EmergencyRequestForm";
import { LiveCounterBadge } from "@/components/landing/LiveCounterBadge";
import { SocialSection } from "@/components/landing/SocialSection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 px-4 dark:bg-zinc-950">
      <Header />

      <main className="mx-auto w-full max-w-6xl pb-16">
        <HeroSection />

        <div className="mt-2 grid gap-6 lg:grid-cols-2 lg:items-start">
          <LiveCounterBadge />
          <SocialSection />
        </div>

        <EmergencyRequestForm />

        <AuthSection />
      </main>
    </div>
  );
}
