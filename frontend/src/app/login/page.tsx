import { Header } from "@/components/layout/Header";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 px-4 dark:bg-zinc-950">
      <Header />

      <main className="mx-auto w-full max-w-6xl pb-16 pt-6">
        <LoginForm />
      </main>
    </div>
  );
}

