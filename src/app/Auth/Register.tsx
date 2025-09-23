import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { FaUserPlus } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
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
    setForm((f) => ({ ...f, [name]: value }));
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-xl border border-gray-300" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-center mb-6">
          <img src="/images/logo.png" alt="logo" className="h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Create your account</h1>
        <p className="text-gray-500 mb-6">Join as a technician or employer</p>

        {error ? (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
        ) : null}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
          <Input label="Username" name="username" value={form.username} onChange={onChange} required />
          <Input label="Email" type="email" name="email" value={form.email} onChange={onChange} required />
          <Input label="Password" type="password" name="password" value={form.password} onChange={onChange} required />
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-gray-700">Role</span>
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              className="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="technician">Technician</option>
              <option value="employer">Employer</option>
            </select>
          </label>
          <Input label="Phone (optional)" name="phone_number" value={form.phone_number} onChange={onChange} />
          <Input label="Location" name="location" value={form.location} onChange={onChange} required />

          <div className="md:col-span-2 mt-2">
            <Button type="submit" variant="primary" loading={loading} leftIcon={<FaUserPlus />} className="w-full">
              Create account
            </Button>
          </div>
        </form>

        <div className="mt-4 text-sm text-gray-600 text-center">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
