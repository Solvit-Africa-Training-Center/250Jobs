import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LuLogIn } from "react-icons/lu";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email.trim(), password);

      if ((user.role || "").toLowerCase() === "employer") {
        navigate("/employer/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-300"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-3">
          <img src="/images/logo.png" alt="logo" className="h-30" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mt-2">
          Welcome back
        </h1>
        <p className="text-gray-500 mb-6">Sign in to continue</p>

        {/* Error message */}
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            leftIcon={<LuLogIn />}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        {/* Links */}
        <div className="mt-4 text-sm text-gray-600 flex justify-between">
          <Link
            to="/reset-password"
            className="text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
          <span>
            No account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
