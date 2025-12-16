"use client"

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, LucideIcon, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Reuse components from signin-page
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card border border-border rounded-lg ${className}`}>{children}</div>
);

const FormHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-center space-y-2">
    <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
    <p className="text-muted-foreground">{subtitle}</p>
  </div>
);

interface InputFieldProps {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
  required?: boolean;
}

const InputField = ({ id, type, label, placeholder, value, onChange, icon: Icon, required = false }: InputFieldProps) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-11 pl-10 pr-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-300"
        required={required}
      />
    </div>
  </div>
);

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  required?: boolean;
}

const PasswordField = ({ id, label, placeholder, value, onChange, showPassword, onTogglePassword, required = false }: PasswordFieldProps) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-11 pl-10 pr-10 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-300"
        required={required}
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

const Checkbox = ({ id, label, checked, onChange }: { id: string; label: React.ReactNode; checked?: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer">
    <input id={id} type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 rounded border-input text-primary focus:ring-primary focus:ring-offset-background" />
    <span className="text-muted-foreground select-none text-sm">{label}</span>
  </label>
);

const Link = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-primary hover:opacity-80 font-medium transition-opacity duration-300">{children}</a>
);

interface ButtonProps {
  type?: "button" | "submit";
  variant?: "primary" | "outline";
  onClick?: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

const Button = ({ type = "button", variant = "primary", onClick, children, fullWidth = false, disabled = false }: ButtonProps) => {
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-lg hover:opacity-90",
    outline: "border border-border bg-background hover:bg-secondary text-foreground"
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-11 rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background flex items-center justify-center gap-2 ${variants[variant]} ${fullWidth ? "w-full" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
};

const Divider = ({ text }: { text: string }) => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">{text}</span></div>
  </div>
);

const SocialButton = ({ provider: _provider, onClick, children }: { provider: "google"; onClick: () => void; children: React.ReactNode }) => (
  <Button variant="outline" onClick={onClick} fullWidth>
    <GoogleIcon className="h-5 w-5" />
    {children}
  </Button>
);

const AnimatedBlob = ({ color, position, delay = "" }: { color: string; position: string; delay?: string }) => (
  <div className={`absolute ${position} w-72 h-72 ${color} rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob ${delay}`} />
);

const GradientWave = () => (
  <div className="absolute inset-0 opacity-20">
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 560">
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path fill="url(#gradient1)" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,560L1392,560C1344,560,1248,560,1152,560C1056,560,960,560,864,560C768,560,672,560,576,560C480,560,384,560,288,560C192,560,96,560,48,560L0,560Z" />
    </svg>
  </div>
);

const ProgressDots = ({ count = 3, activeIndex = 2 }: { count?: number; activeIndex?: number }) => (
  <div className="flex justify-center gap-2 pt-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={`w-2 h-2 rounded-full ${index <= activeIndex ? "bg-white" : "bg-white/40"}`} />
    ))}
  </div>
);

const IconBadge = ({ icon }: { icon: React.ReactNode }) => (
  <div className="inline-flex rounded-full p-3 bg-white/10 backdrop-blur-sm text-white mb-4">{icon}</div>
);

const HeroSection = ({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) => (
  <div className="text-center space-y-6 max-w-md">
    {icon && <IconBadge icon={icon} />}
    <h2 className="text-3xl lg:text-4xl font-bold text-white">{title}</h2>
    <p className="text-lg text-white/80">{description}</p>
    <ProgressDots />
  </div>
);

const GradientBackground = ({ children }: { children: React.ReactNode }) => (
  <div className="hidden lg:flex flex-1 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900" />
    <div className="absolute inset-0">
      <AnimatedBlob color="bg-indigo-500/30" position="top-0 -left-4" />
      <AnimatedBlob color="bg-cyan-500/30" position="top-0 -right-4" delay="animation-delay-2000" />
      <AnimatedBlob color="bg-indigo-600/30" position="-bottom-8 left-20" delay="animation-delay-4000" />
    </div>
    <GradientWave />
    <div className="relative z-10 flex items-center justify-center p-8 lg:p-12 w-full">{children}</div>
  </div>
);

const FormFooter = ({ text, linkText, linkHref }: { text: string; linkText: string; linkHref: string }) => (
  <p className="mt-6 text-center text-sm text-muted-foreground">
    {text} <Link href={linkHref}>{linkText}</Link>
  </p>
);

// ============================================================================
// MAIN SIGNUP COMPONENT
// ============================================================================

const SignUp = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);
    console.log('Starting signup process...');

    try {
      console.log('Calling supabase.auth.signUp with email:', email.trim());

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim()
          }
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        setError(error.message);
        setIsLoading(false);
      } else if (data.user) {
        console.log('Signup successful! User:', data.user.id);
        console.log('Session created:', data.session ? 'Yes' : 'No');

        // Check if email confirmation is required
        if (!data.session) {
          console.warn('No session created - email confirmation is enabled');
          setError('Please check your email to confirm your account before signing in.');
          setIsLoading(false);
        } else {
          // Session created - email confirmation is disabled
          console.log('Redirecting to dashboard...');
          router.push('/dashboard');
        }
      } else {
        console.warn('No error but no user returned');
        setError('Signup completed but no user data returned. Please try signing in.');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error('Unexpected error during signup:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
    } catch {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <FormHeader
            title="Create your account"
            subtitle="Sign up to get started"
          />

          <Card className="p-6 sm:p-8 shadow-sm">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                id="name"
                type="text"
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />

              <InputField
                id="email"
                type="email"
                label="Email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />

              <PasswordField
                id="password"
                label="Password"
                placeholder="Create a password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                required
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                required
              />

              <Checkbox
                id="terms"
                label={
                  <>
                    I agree to the <Link href="/terms-of-service">Terms of Service</Link> and <Link href="/privacy-policy">Privacy Policy</Link>
                  </>
                }
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />

              <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>

              <Divider text="Or continue with" />

              <SocialButton provider="google" onClick={handleGoogleSignUp}>
                Continue with Google
              </SocialButton>
            </form>

            <FormFooter
              text="Already have an account?"
              linkText="Sign in"
              linkHref="/sign-in"
            />
          </Card>
        </div>
      </div>

      <GradientBackground>
        <HeroSection
          title="Join Thousands of Users"
          description="Start your journey with us today. Create an account and unlock powerful features designed for your success."
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        />
      </GradientBackground>
    </div>
  );
};

export default SignUp;
