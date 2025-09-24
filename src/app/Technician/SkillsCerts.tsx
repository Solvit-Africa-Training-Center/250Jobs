import { LiaCertificateSolid } from "react-icons/lia";
import { FiTrash2 } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { getCurrentTechnician, updateCurrentTechnician, uploadCertificate } from "../../api/technicians";
import type { TechnicianProfile } from "../../types/technician";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

type Props = { onUpdated?: (p: TechnicianProfile) => void; editMode?: boolean };

export default function SkillsCerts({ onUpdated, editMode }: Props) {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localCertUrl, setLocalCertUrl] = useState<string | null>(null);
  const [localCertDataUrl, setLocalCertDataUrl] = useState<string | null>(null);
  const [serverCertOk, setServerCertOk] = useState<boolean | null>(null);
  // keep track of a preview of the current file selection
  // (existing previewUrl covers single-selection preview)

  const storageKey = useMemo(() => {
    const uid = localStorage.getItem("authUserId");
    return uid ? `technicianCertUrl:${uid}` : null;
  }, []);
  const storageKeyData = useMemo(() => {
    const uid = localStorage.getItem("authUserId");
    return uid ? `technicianCertData:${uid}` : null;
  }, []);
  const lastDataKey = "technicianCertData:last";
  // no list key now; single preview/upload only

  const load = async () => {
    setError(null);
    try {
      const me = await getCurrentTechnician();
      setProfile(me);
      // Load cached URL fallback if backend path is absent
      if (!me?.certificates && storageKey) {
        const cached = localStorage.getItem(storageKey);
        if (cached) setLocalCertUrl(cached);
      }
      // Load cached data URI (works offline / no backend media serving)
      const cachedData = storageKeyData ? localStorage.getItem(storageKeyData) : localStorage.getItem(lastDataKey);
      if (cachedData) setLocalCertDataUrl(cachedData);
      // skip loading lists — we only show primary and a single preview
    } catch (e: any) {
      setError(e?.message || "Failed to load profile");
    }
  };

  useEffect(() => { load(); }, []);

  const onAddSkill = async () => {
    const name = newSkill.trim();
    if (!name) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const existing = (profile?.skills || []).map((s) => s.name);
      const updated = await updateCurrentTechnician({ skill_names: Array.from(new Set([...existing, name])) });
      setProfile(updated);
      onUpdated && onUpdated(updated);
      setNewSkill("");
      setMessage("Skill added");
    } catch (e: any) {
      setError(e?.message || "Failed to add skill");
    } finally {
      setSaving(false);
    }
  };

  const onRemoveSkill = async (name: string) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const existing = (profile?.skills || []).map((s) => s.name);
      const next = existing.filter((n) => n.toLowerCase() !== name.toLowerCase());
      const updated = await updateCurrentTechnician({ skill_names: next });
      setProfile(updated);
      onUpdated && onUpdated(updated);
      setMessage("Skill removed");
    } catch (e: any) {
      setError(e?.message || "Failed to remove skill");
    } finally {
      setSaving(false);
    }
  };

  const onUploadCert = async () => {
    if (!certFile) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await uploadCertificate(certFile);
      setProfile(updated);
      onUpdated && onUpdated(updated);
      setCertFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (storageKey && updated?.certificates) {
        localStorage.setItem(storageKey, updated.certificates);
        setLocalCertUrl(updated.certificates);
      }
      // Persist data URI so it can be viewed without hitting backend
      if (storageKeyData && localCertDataUrl) {
        localStorage.setItem(storageKeyData, localCertDataUrl);
        localStorage.setItem(lastDataKey, localCertDataUrl);
      }
      setMessage("Certificate uploaded");
      // Persist preview data URL so it survives reloads (single)
      if (storageKeyData && localCertDataUrl) {
        localStorage.setItem(storageKeyData, localCertDataUrl);
        localStorage.setItem(lastDataKey, localCertDataUrl);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to upload certificate");
    } finally {
      setSaving(false);
    }
  };

  const onPickFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const first = files[0];
    setCertFile(first);
    // preview only the first selected file
    try {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(first);
      setPreviewUrl(url);
    } catch {}
    // also keep a data URL for upload confirmation (single)
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : null;
        if (!result) return;
        setLocalCertDataUrl(result);
      };
      reader.readAsDataURL(first);
    } catch {}
  };

  const isImageUrl = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.startsWith("data:image/") ||
      lower.endsWith(".png") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".gif") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".bmp")
    );
  };

  const fixLegacyCertPath = (url?: string | null) => {
    if (!url) return url || null;
    // If backend previously returned /certs/... map to /media/certs/ for dev
    if (url.startsWith('/certs/')) return `/media${url}`;
    return url;
  };

  // Verify server certificate link actually resolves; hide server link if 404
  useEffect(() => {
    const url = fixLegacyCertPath(profile?.certificates);
    if (!url) {
      setServerCertOk(null);
      return;
    }
    let cancelled = false;
    const check = async () => {
      try {
        if (isImageUrl(url)) {
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('img-error'));
            img.src = url;
          });
          if (!cancelled) setServerCertOk(true);
        } else {
          const res = await fetch(url, { method: 'HEAD' });
          if (!cancelled) setServerCertOk(res.ok);
        }
      } catch {
        if (!cancelled) setServerCertOk(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, [profile?.certificates]);

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 border border-gray-300 mb-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">Skills</h3>
        <p className="text-gray-500 mb-5">Showcase your technical abilities</p>

        {error && <div className="text-red-600 mb-2">{error}</div>}
        {message && <div className="text-green-600 mb-2">{message}</div>}

        <div className="flex flex-wrap gap-3">
          {(profile?.skills || []).map((s) => (
            <span key={s.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f5f5fc] border border-gray-200 text-gray-800 rounded-full text-sm font-medium">
              {s.name}
              {editMode && (
                <button
                  type="button"
                  aria-label={`Remove ${s.name}`}
                  className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                  onClick={() => onRemoveSkill(s.name)}
                  disabled={saving}
                  title="Remove"
                >
                  ×
                </button>
              )}
            </span>
          ))}
          {!profile?.skills?.length && <span className="text-gray-500">No skills yet. Add your first skill.</span>}
        </div>

        <div className="mt-4 flex gap-2 items-center">
          <Input
            placeholder={editMode ? "Add a skill" : "Click Edit to manage skills"}
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            disabled={!editMode}
          />
          <Button onClick={onAddSkill} loading={saving} disabled={!editMode}>Add</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-300 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <LiaCertificateSolid className="text-2xl text-black" />
          <h3 className="text-xl font-semibold text-gray-900">Certifications</h3>
        </div>
        <p className="text-gray-500 mb-5">Your professional certifications and licenses</p>

        <div className="flex flex-col gap-3">
          {previewUrl && (
            <div className="flex items-center gap-3">
              <img src={previewUrl} alt="Certificate preview" className="h-24 w-auto rounded border border-gray-200" />
              <span className="text-sm text-gray-500">Preview (not saved yet)</span>
            </div>
          )}

          {profile?.certificates && serverCertOk !== false ? (
            isImageUrl(profile.certificates) ? (
              <div className="flex items-center gap-3">
                <a href={fixLegacyCertPath(profile.certificates) || undefined} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3">
                  <img src={fixLegacyCertPath(profile.certificates) || undefined} alt="Certificate" className="h-28 w-auto rounded border border-gray-200" />
                </a>
                {editMode && (
                  <Button
                    variant="outline"
                    className="border-red-300 !text-red-700 hover:!bg-red-50 hover:!text-red-800 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors"
                    leftIcon={<FiTrash2 className="text-red-600" />}
                    onClick={async () => {
                    try {
                      setSaving(true);
                      const updated = await updateCurrentTechnician({ certificates: null } as any);
                      setProfile(updated);
                      onUpdated && onUpdated(updated);
                      setMessage("Certificate removed");
                      setLocalCertUrl(null);
                      if (storageKey) localStorage.removeItem(storageKey);
                    } catch (e: any) {
                      setError(e?.message || 'Failed to remove certificate');
                    } finally {
                      setSaving(false);
                    }
                  }}>Remove</Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a href={fixLegacyCertPath(profile.certificates) || undefined} target="_blank" className="flex items-center gap-2 px-4 py-4 bg-[#f5f5fc] text-blue-700 rounded-lg text-sm font-semibold" rel="noreferrer">
                  <LiaCertificateSolid className="text-blue-600 text-lg" />
                  View current certificate
                </a>
                {editMode && (
                  <Button
                    variant="outline"
                    className="border-red-300 !text-red-700 hover:!bg-red-50 hover:!text-red-800 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors"
                    leftIcon={<FiTrash2 className="text-red-600" />}
                    onClick={async () => {
                    try {
                      setSaving(true);
                      const updated = await updateCurrentTechnician({ certificates: null } as any);
                      setProfile(updated);
                      onUpdated && onUpdated(updated);
                      setMessage("Certificate removed");
                    } catch (e: any) {
                      setError(e?.message || 'Failed to remove certificate');
                    } finally {
                      setSaving(false);
                    }
                  }}>Remove</Button>
                )}
              </div>
            )
          ) : (
            <span className="text-gray-500">{serverCertOk === false ? 'Certificate link unavailable on server. Please re-upload.' : 'No certificate uploaded.'}</span>
          )}
          
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input type="file" multiple onChange={(e) => onPickFiles(e.target.files)} className="block text-sm" accept="application/pdf,image/*" disabled={!editMode} />
          <Button onClick={onUploadCert} loading={saving} disabled={!editMode || !certFile} className="!text-black hover:!text-black">Upload Selected</Button>
          {!editMode && <span className="text-xs text-gray-500">Click Edit to manage certificates</span>}
        </div>
      </div>
    </div>
  );
}
