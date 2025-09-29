import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import { FaUserPlus } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const normalizeUsername = (value: string) =>
    value.replace(/[^A-Za-z\s]/g, "").replace(/\s+/g, " ").replace(/^\s*/, "").slice(0, 150);

  const toUsernameValue = (value: string) => value.trim().replace(/\s+/g, "_");
  const normalizeEmail = (value: string) => value.replace(/\s+/g, "").toLowerCase();

  const [displayUsername, setDisplayUsername] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "technician" as "technician" | "employer" | "admin",
    phone_number: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "username") {
      const normalized = normalizeUsername(value);
      setDisplayUsername(normalized);
      setForm((f) => ({ ...f, username: toUsernameValue(normalized) }));
      setError(null);
      return;
    }
    if (name === "email") {
      const normalizedEmail = normalizeEmail(value);
      setForm((f) => ({ ...f, email: normalizedEmail }));
      setError(null);
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
    setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        phone_number: form.phone_number || undefined,
        location: form.location,
      });
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative bg-cover bg-center"
      style={{ backgroundImage: "url('/images/image.png')" }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative z-10 backdrop-blur-md rounded-3xl p-8 sm:p-10 w-full max-w-lg shadow-2xl flex flex-col justify-center bg-[#F8FCFF]">
      <div className="flex justify-center mb-1">
  <img
    src="/images/logo.png"
    alt="Logo"
    className="h-20 sm:h-24 object-contain drop-shadow-lg"
  />
</div>


<h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Create your account</h1>
<p className="text-gray-600 text-center mb-4 text-sm">Join as a technician or employer</p>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}


        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={onSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">Username</label>
            <input
              type="text"
              name="username"
              value={displayUsername}
              onChange={onChange}
              placeholder="e.g. Belyse Ingabire"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none shadow-sm text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none shadow-sm text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none shadow-sm text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              className="w-full bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 text-sm"
            >
              <option value="technician">Technician</option>
              <option value="employer">Employer</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">Phone (optional)</label>
            <input
              type="text"
              name="phone_number"
              value={form.phone_number}
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none shadow-sm text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={onChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none shadow-sm text-sm"
            />
          </div>

          <div className="md:col-span-2 mt-3">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              leftIcon={<FaUserPlus />}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Create account
            </Button>
          </div>
        </form>

  
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-3 text-gray-500 text-sm font-medium">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

    
        {/* <Button
          type="button"
          onClick={handleGoogleLogin}
          variant="secondary"
          className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 py-3 rounded-xl shadow-sm font-medium"
          disabled={loading}
        >
          <FcGoogle size={20} />
          Sign in with Google
        </Button> */}

      
        <div className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
