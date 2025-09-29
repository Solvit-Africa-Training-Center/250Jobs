import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LuLogIn } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";

import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
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
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      if ((user.role || "").toLowerCase() === "employer") {
        navigate("/employer/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative bg-gray-100"
      style={{
        backgroundImage: "url('/images/image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div
        className="relative z-10 backdrop-blur-md rounded-3xl p-8 w-full max-w-md shadow-2xl min-h-[560px]"
        style={{ backgroundColor: "#F8FCFF" }}
      >
        {/* Logo */}
        <div className="flex justify-center -mb-4">
          <img src="/images/logo.png" alt="Logo" className="h-28 drop-shadow-xl" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
          Welcome Back
        </h1>
        <p className="text-gray-600 text-center mb-4 text-sm">
          Sign in to continue
        </p>

        {/* Error */}
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none shadow-sm text-sm text-gray-900 transition"
            />
          </div>

          <div className="flex flex-col relative">
            <label htmlFor="password" className="text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none shadow-sm text-sm text-gray-900 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            leftIcon={<LuLogIn />}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 rounded-2xl shadow hover:scale-105 transition-transform text-sm"
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google login */}
        {/* <Button
          type="button"
          onClick={handleGoogleLogin}
          variant="secondary"
          className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 py-2 rounded-xl shadow-sm transition"
          disabled={loading}
        >
          <FcGoogle size={20} /> Sign in with Google
        </Button> */}

        {/* Links */}
        <div className="mt-4 text-sm text-gray-700 flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
          <Link to="/reset-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
          <span className="text-gray-800">
            No account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline font-semibold">
              Create one
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
