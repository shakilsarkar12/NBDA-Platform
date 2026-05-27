import { Header } from "@/components/layout/Header";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 px-4 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto w-full max-w-6xl pb-16 pt-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-zinc-900">Profile Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Login successful. This is a placeholder dashboard page for the next
            implementation phase.
          </p>
        </div>
      </main>
    </div>
  );
}

