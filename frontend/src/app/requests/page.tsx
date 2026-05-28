import { Header } from "@/components/layout/Header";
import { LiveRequestFeed } from "@/components/requests/LiveRequestFeed";

export default function RequestsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
        <LiveRequestFeed />
      </main>
    </div>
  );
}

