import { useEffect, useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { getCurrentTechnician, updateCurrentTechnician } from "../../api/technicians";
import type { TechnicianProfile } from "../../types/technician";

type Props = {
  editMode?: boolean;
  profile?: TechnicianProfile;
  draftUsername?: string;
  setDraftUsername?: (v: string) => void;
  draftPhone?: string;
  setDraftPhone?: (v: string) => void;
  draftLocation?: string;
  setDraftLocation?: (v: string) => void;
};

export default function ContactInfo({
  editMode,
  profile: profileProp,
  draftUsername,
  setDraftUsername,
  draftPhone,
  setDraftPhone,
  draftLocation,
  setDraftLocation,
}: Props) {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (profileProp) {
          setProfile(profileProp);
          setEmail(profileProp.email || "");
          if (!editMode) {
            const full = `${profileProp.first_name || ""} ${profileProp.last_name || ""}`.trim().replace(/\s+/g, " ");
            setUsername(full);
            setPhone((profileProp as any).phone || (profileProp as any).phone_number || "");
            setLocation(profileProp.location || "");
          }
        } else {
          const me = await getCurrentTechnician();
          setProfile(me);
          setEmail(me.email || "");
          if (!editMode) {
            const full = `${me.first_name || ""} ${me.last_name || ""}`.trim().replace(/\s+/g, " ");
            setUsername(full);
            setPhone((me as any).phone || (me as any).phone_number || "");
            setLocation(me.location || "");
          }
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      }
    })();
  }, [profileProp, editMode]);

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateCurrentTechnician({
        first_name: firstName,
        last_name: lastName,
        location: location,
      });
      setProfile(updated);
      setMessage("Saved");
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white  rounded-2xl p-6 border border-gray-300">
      <h3 className="text-xl font-semibold text-gray-900 mb-1">Contact Information</h3>
      <p className="text-gray-500 mb-5">Update your contact details</p>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {message && <div className="text-green-600 mb-2">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Username"
          placeholder="Enter full name"
          value={editMode ? (draftUsername || "") : (username)}
          readOnly={!editMode}
          onChange={(e) => (editMode && setDraftUsername ? setDraftUsername(e.target.value) : setUsername(e.target.value))}
        />
        <Input
          label="Phone Number"
          placeholder="e.g. +250 7xx xxx xxx"
          value={editMode ? (draftPhone || "") : (phone)}
          readOnly={!editMode}
          type="tel"
          onChange={(e) => (editMode && setDraftPhone ? setDraftPhone(e.target.value) : setPhone(e.target.value))}
        />
        <Input label="Email" value={email} readOnly />
        <Input
          label="Location"
          value={editMode ? (draftLocation || "") : (profileProp?.location ?? location)}
          readOnly={!editMode}
          onChange={(e) => (editMode && setDraftLocation ? setDraftLocation(e.target.value) : setLocation(e.target.value))}
        />
      </div>

      {/* Save button removed; global Save/Cancel controls changes */}
    </div>
  );
}
