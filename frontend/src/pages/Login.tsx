import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(identifier, password);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <img src="/logo.png" alt="Global Wings Charity" className="h-12 w-12 object-contain" />
              <div className="flex flex-col leading-tight text-left">
                <span className="font-heading text-2xl font-bold text-foreground">
                  Global Wings <span className="text-secondary">Charity</span>
                </span>
                <span className="text-xs text-muted-foreground">Create a better future</span>
              </div>
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground mt-6">
              Staff Login
            </h1>
            <p className="text-muted-foreground mt-2">
              For administrators and teachers only
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="admin@globalwingscharity.org"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:block flex-1 relative bg-gradient-hero">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-primary-foreground">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Teacher & Admin Portal
            </h2>
            <p className="text-xl opacity-90">
              Manage students, track attendance, and monitor academic progress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
