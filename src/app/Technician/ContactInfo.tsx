import { useEffect, useMemo, useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { getCurrentTechnician, updateCurrentTechnician, uploadNationalIdDocument } from "../../api/technicians";
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
  onProfileChange?: (profile: TechnicianProfile) => void;
};

const resolveMediaUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  if (url.startsWith("/media/")) return url;
  if (url.startsWith("/")) return `/media${url}`;
  return `/media/${url}`;
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
  onProfileChange,
}: Props) {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [nationalIdPreview, setNationalIdPreview] = useState<string | null>(null);
  const [uploadingNationalId, setUploadingNationalId] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const hydrateFrom = (data: TechnicianProfile | null) => {
      if (!data || cancelled) return;
      setProfile(data);
      setEmail(data.email || "");
      if (!editMode) {
        const full = `${data.first_name || ""} ${data.last_name || ""}`.trim().replace(/\s+/g, " ");
        setUsername(full);
        setPhone((data as any).phone || (data as any).phone_number || "");
        setLocation(data.location || "");
      }
    };

    (async () => {
      try {
        setError(null);
        if (profileProp) {
          hydrateFrom(profileProp);
        } else {
          const me = await getCurrentTechnician();
          if (!cancelled) {
            hydrateFrom(me);
            onProfileChange?.(me);
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load profile");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileProp, editMode, onProfileChange]);

  useEffect(() => () => {
    if (nationalIdPreview) URL.revokeObjectURL(nationalIdPreview);
  }, [nationalIdPreview]);

  const nationalIdUrl = useMemo(() => resolveMediaUrl(profile?.national_id_document), [profile?.national_id_document]);

  const onSelectNationalId = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (nationalIdPreview) URL.revokeObjectURL(nationalIdPreview);
    const preview = URL.createObjectURL(file);
    setNationalIdPreview(preview);
    setNationalIdFile(file);
  };

  const uploadNationalId = async () => {
    if (!nationalIdFile) return;
    setUploadingNationalId(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await uploadNationalIdDocument(nationalIdFile);
      setProfile(updated);
      onProfileChange?.(updated);
      setMessage("National ID uploaded successfully");
      setNationalIdFile(null);
      if (nationalIdPreview) {
        URL.revokeObjectURL(nationalIdPreview);
        setNationalIdPreview(null);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to upload national ID");
    } finally {
      setUploadingNationalId(false);
    }
  };

  const removeNationalId = async () => {
    setUploadingNationalId(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateCurrentTechnician({ national_id_document: null } as any);
      setProfile(updated);
      onProfileChange?.(updated);
      setMessage("National ID removed");
    } catch (e: any) {
      setError(e?.message || "Failed to remove national ID");
    } finally {
      setUploadingNationalId(false);
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
          value={editMode ? (draftUsername || "") : username}
          readOnly={!editMode}
          onChange={(e) => (editMode && setDraftUsername ? setDraftUsername(e.target.value) : setUsername(e.target.value))}
        />
        <Input
          label="Phone Number"
          placeholder="e.g. +250 7xx xxx xxx"
          value={editMode ? (draftPhone || "") : phone}
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

      <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">National ID Document</h4>
        <p className="text-gray-500 mb-4">Upload a clear copy of your valid national ID.</p>

        {nationalIdPreview && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-600">Selected file:</span>
            <span className="text-sm font-medium text-gray-800">{nationalIdFile?.name}</span>
            <span className="text-xs text-gray-500">(not uploaded yet)</span>
          </div>
        )}

        {nationalIdUrl ? (
          <a
            href={nationalIdUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold"
          >
            View current national ID
          </a>
        ) : (
          <span className="text-gray-500 text-sm">No national ID uploaded yet.</span>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => onSelectNationalId(e.target.files)}
            disabled={!editMode || uploadingNationalId}
            className="block"
          />
          <Button
            onClick={uploadNationalId}
            disabled={!editMode || !nationalIdFile || uploadingNationalId}
            loading={uploadingNationalId}
          >
            Upload Selected
          </Button>
          {profile?.national_id_document && editMode && (
            <Button
              variant="outline"
              onClick={removeNationalId}
              disabled={uploadingNationalId}
              className="border-red-300 !text-red-700 hover:!bg-red-50 hover:!text-red-800"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
