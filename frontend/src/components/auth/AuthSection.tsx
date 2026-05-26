import { RegistrationForm } from "./RegistrationForm";
import { LoginForm } from "./LoginForm";

export function AuthSection() {
  return (
    <section className="mt-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <RegistrationForm />
        <LoginForm />
      </div>
    </section>
  );
}

