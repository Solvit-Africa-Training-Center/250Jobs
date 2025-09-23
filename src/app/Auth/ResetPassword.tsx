import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { requestPasswordReset } from "../../api/auth";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await requestPasswordReset(email);
      setSent(res.detail || "If the email exists, a reset was sent.");
    } catch (err: any) {
      setError(err?.message || "Failed to request reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-300" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Reset password</h1>
        <p className="text-gray-500 mb-6">Enter your email to receive reset instructions</p>

        {sent ? <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">{sent}</div> : null}
        {error ? <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div> : null}

        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <Link to="/login" className="text-blue-600 hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
