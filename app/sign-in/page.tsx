import { SmokeyBackground, LoginForm } from "@/components/ui/login-form";

export default function SignInPage() {
  return (
    <main className="relative w-screen h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <SmokeyBackground className="absolute inset-0" />
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
        <LoginForm />
      </div>
    </main>
  );
}
