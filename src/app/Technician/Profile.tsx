import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { getCurrentTechnician, updateCurrentTechnician } from "../../api/technicians";
import type { TechnicianProfile } from "../../types/technician";

function Profile() {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  // Certificates are uploaded via Skills & Certs tab
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentTechnician();
        setProfile(me);
        setFirstName(me.first_name || "");
        setLastName(me.last_name || "");
        setEmail(me.email || "");
        setBio(me.bio || "");
        setSkills((me.skills || []).map((s) => s.name).join(", "));
        // certificates handled elsewhere
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      }
    })();
  }, []);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const skill_names = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const updated = await updateCurrentTechnician({
        first_name: firstName,
        last_name: lastName,
        bio,
        skill_names,
      });
      setProfile(updated);
      setMessage("Profile updated");
    } catch (e: any) {
      setError(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="pt-28 px-4 md:px-16 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 transition border border-gray-300" style={{ boxShadow: "0px 2px 2px 2px rgba(0, 0, 0, 0.08)" }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Profile Information</h3>
              <p className="text-gray-500 mb-5">Update your professional profile</p>

              {error && <div className="text-red-600 mb-2">{error}</div>}
              {message && <div className="text-green-600 mb-2">{message}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="mt-4">
                <Input label="Email" value={email} readOnly />
              </div>

              <div className="mt-6">
                <Input label="Professional Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>

              <div className="mt-4">
                <Input label="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
              </div>

              <div className="pt-6 flex justify-end">
                <Button onClick={onSave} loading={saving}>Save Profile</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
