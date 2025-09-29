import { useEffect, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { getEmployerMe, updateEmployerMe, uploadEmployerLogo } from "../../api/employers";
import type { EmployerProfile } from "../../types/employer";

export default function EmployerProfile() {
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [company_name, setCompany] = useState("");
  const [company_description, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getEmployerMe();
        setProfile(me);
        setCompany(me.company_name || "");
        setDesc(me.company_description || "");
        setLocation(me.location || "");
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateEmployerMe({ company_name, company_description, location });
      setProfile(updated);
      setMessage("Saved");
      if (logoFile) {
        const upd2 = await uploadEmployerLogo(logoFile);
        setProfile(upd2);
        setLogoFile(null);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="pt-24 px-6">Loading...</div>;

  return (
    <div className="pt-24 px-6 m- m-16 ">
      <div className="bg-white rounded-2xl p-6 transition border border-gray-300" style={{ boxShadow: "0px 1px 1px rgba(0,0,0,0.1)" }}>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Company Profile</h2>
        <p className="text-gray-500 mb-4">Update your company details</p>

        {error && <div className="text-red-600 mb-2">{error}</div>}
        {message && <div className="text-green-700 mb-2">{message}</div>}

        <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Company Name" value={company_name} onChange={(e) => setCompany(e.target.value)} required />
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <label className="block md:col-span-2">
            <span className="block mb-1 text-sm font-medium text-gray-700">Company Description</span>
            <textarea className="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" rows={4} value={company_description} onChange={(e) => setDesc(e.target.value)} />
          </label>
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-gray-700">Logo</span>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="block text-sm" />
            {profile?.logo ? (
              <a href={profile.logo} target="_blank" rel="noreferrer" className="text-blue-600 text-sm mt-1 inline-block">View current logo</a>
            ) : (
              <span className="text-gray-500 text-sm">No logo uploaded</span>
            )}
          </label>

          <div className="md:col-span-2 pt-2">
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

