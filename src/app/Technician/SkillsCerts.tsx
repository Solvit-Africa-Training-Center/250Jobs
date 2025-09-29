import { LiaCertificateSolid } from "react-icons/lia";
import { FiTrash2, FiShield } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { getCurrentTechnician, updateCurrentTechnician, uploadCertificate, uploadCriminalRecord } from "../../api/technicians";
import type { TechnicianProfile } from "../../types/technician";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useTheme } from "../../context/ThemeContext";

type Props = { onUpdated?: (p: TechnicianProfile) => void; editMode?: boolean };

const resolveMediaUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  if (url.startsWith("/media/")) return url;
  if (url.startsWith("/")) return `/media${url}`;
  return `/media/${url}`;
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

const checkRemoteAsset = async (url: string) => {
  try {
    if (isImageUrl(url)) {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("img-error"));
        img.src = url;
      });
      return true;
    }
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
};

export default function SkillsCerts({ onUpdated, editMode }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [criminalSaving, setCriminalSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPreviewUrl, setCertPreviewUrl] = useState<string | null>(null);
  const [localCertUrl, setLocalCertUrl] = useState<string | null>(null);
  const [localCertDataUrl, setLocalCertDataUrl] = useState<string | null>(null);
  const [serverCertOk, setServerCertOk] = useState<boolean | null>(null);
  const [criminalFile, setCriminalFile] = useState<File | null>(null);
  const [criminalPreviewUrl, setCriminalPreviewUrl] = useState<string | null>(null);
  const [serverCriminalOk, setServerCriminalOk] = useState<boolean | null>(null);

  const storageKey = useMemo(() => {
    const uid = localStorage.getItem("authUserId");
    return uid ? `technicianCertUrl:${uid}` : null;
  }, []);
  const storageKeyData = useMemo(() => {
    const uid = localStorage.getItem("authUserId");
    return uid ? `technicianCertData:${uid}` : null;
  }, []);
  const lastDataKey = "technicianCertData:last";

  const load = async () => {
    setError(null);
    try {
      const me = await getCurrentTechnician();
      setProfile(me);
      onUpdated && onUpdated(me);
      if (!me?.certificates && storageKey) {
        const cached = localStorage.getItem(storageKey);
        if (cached) setLocalCertUrl(cached);
      }
      const cachedData = storageKeyData ? localStorage.getItem(storageKeyData) : localStorage.getItem(lastDataKey);
      if (cachedData) setLocalCertDataUrl(cachedData);
    } catch (e: any) {
      setError(e?.message || "Failed to load profile");
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => () => {
    if (certPreviewUrl) URL.revokeObjectURL(certPreviewUrl);
  }, [certPreviewUrl]);

  useEffect(() => () => {
    if (criminalPreviewUrl) URL.revokeObjectURL(criminalPreviewUrl);
  }, [criminalPreviewUrl]);

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

  const onPickCertificate = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const first = files[0];
    setCertFile(first);
    if (certPreviewUrl) URL.revokeObjectURL(certPreviewUrl);
    const url = URL.createObjectURL(first);
    setCertPreviewUrl(url);

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;
      setLocalCertDataUrl(result);
    };
    reader.readAsDataURL(first);
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
      if (certPreviewUrl) {
        URL.revokeObjectURL(certPreviewUrl);
        setCertPreviewUrl(null);
      }
      if (storageKey && updated?.certificates) {
        localStorage.setItem(storageKey, updated.certificates);
        setLocalCertUrl(updated.certificates);
      }
      if (storageKeyData && localCertDataUrl) {
        localStorage.setItem(storageKeyData, localCertDataUrl);
        localStorage.setItem(lastDataKey, localCertDataUrl);
      }
      setMessage("Certificate uploaded");
    } catch (e: any) {
      setError(e?.message || "Failed to upload certificate");
    } finally {
      setSaving(false);
    }
  };

  const onPickCriminalRecord = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const first = files[0];
    setCriminalFile(first);
    if (criminalPreviewUrl) URL.revokeObjectURL(criminalPreviewUrl);
    const url = URL.createObjectURL(first);
    setCriminalPreviewUrl(url);
  };

  const onUploadCriminalRecord = async () => {
    if (!criminalFile) return;
    setCriminalSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await uploadCriminalRecord(criminalFile);
      setProfile(updated);
      onUpdated && onUpdated(updated);
      setCriminalFile(null);
      if (criminalPreviewUrl) {
        URL.revokeObjectURL(criminalPreviewUrl);
        setCriminalPreviewUrl(null);
      }
      setMessage("Criminal record uploaded");
    } catch (e: any) {
      setError(e?.message || "Failed to upload criminal record");
    } finally {
      setCriminalSaving(false);
    }
  };

  const removeCertificate = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateCurrentTechnician({ certificates: null } as any);
      setProfile(updated);
      onUpdated && onUpdated(updated);
      setMessage("Certificate removed");
      setLocalCertUrl(null);
      if (storageKey) localStorage.removeItem(storageKey);
    } catch (e: any) {
      setError(e?.message || "Failed to remove certificate");
    } finally {
      setSaving(false);
    }
  };

  const removeCriminalRecord = async () => {
    setCriminalSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateCurrentTechnician({ criminal_record: null } as any);
      setProfile(updated);
      onUpdated && onUpdated(updated);
      setMessage("Criminal record removed");
    } catch (e: any) {
      setError(e?.message || "Failed to remove criminal record");
    } finally {
      setCriminalSaving(false);
    }
  };

  useEffect(() => {
    const url = resolveMediaUrl(profile?.certificates ?? localCertUrl);
    if (!url) {
      setServerCertOk(null);
      return;
    }
    let cancelled = false;
    checkRemoteAsset(url).then((ok) => {
      if (!cancelled) setServerCertOk(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.certificates, localCertUrl]);

  useEffect(() => {
    const url = resolveMediaUrl(profile?.criminal_record);
    if (!url) {
      setServerCriminalOk(null);
      return;
    }
    let cancelled = false;
    checkRemoteAsset(url).then((ok) => {
      if (!cancelled) setServerCriminalOk(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [profile?.criminal_record]);

  const certificateUrl = resolveMediaUrl(profile?.certificates ?? localCertUrl);
  const criminalRecordUrl = resolveMediaUrl(profile?.criminal_record);
  const isCriminalExpired = profile?.criminal_record_is_expired;

  return (
    <div>
      <div className={`rounded-2xl p-6 border mb-6 shadow-sm ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"}`}>
        <h3 className={`text-xl font-semibold mb-1 ${isDark ? "text-gray-100" : "text-gray-900"}`}>Skills</h3>
        <p className={`mb-5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Showcase your technical abilities</p>

        {error && <div className="text-red-600 mb-2">{error}</div>}
        {message && <div className="text-green-600 mb-2">{message}</div>}

        <div className="flex flex-wrap gap-3">
          {(profile?.skills || []).map((s) => {
            const bgClass = isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-[#f5f5fc] border-gray-200 text-gray-800";
            const removeBtnBg = isDark ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-700";
            return (
              <span key={s.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${bgClass}`}>
                {s.name}
                {editMode && (
                  <button
                    type="button"
                    aria-label={`Remove ${s.name}`}
                    className={`w-5 h-5 inline-flex items-center justify-center rounded-full ${removeBtnBg}`}
                    onClick={() => onRemoveSkill(s.name)}
                    disabled={saving}
                    title="Remove"
                  >
                    x
                  </button>
                )}
              </span>
            );
          })}
          {!profile?.skills?.length && <span className="text-gray-500">No skills yet. Add your first skill.</span>}
        </div>

        <div className="mt-4 flex gap-2 items-center">
          <Input
            placeholder={editMode ? "Add a skill" : "Click Edit to manage skills"}
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            disabled={!editMode}
          />
          <Button onClick={onAddSkill} loading={saving} disabled={!editMode}>
            Add
          </Button>
        </div>
      </div>

      <div className={`rounded-2xl p-6 border mb-6 shadow-sm ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"}`}>
        <div className="flex items-center gap-2 mb-2">
          <LiaCertificateSolid className={`text-2xl ${isDark ? "text-gray-100" : "text-black"}`} />
          <h3 className={`text-xl font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Certifications</h3>
        </div>
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mb-5`}>
          Your professional certifications and licenses
        </p>

        <div className="flex flex-col gap-3">
          {certPreviewUrl && (
            <div className="flex items-center gap-3">
              <img src={certPreviewUrl} alt="Certificate preview" className="h-24 w-auto rounded border border-gray-200" />
              <span className="text-sm text-gray-500">Preview (not saved yet)</span>
            </div>
          )}

          {certificateUrl && serverCertOk !== false ? (
            isImageUrl(certificateUrl) ? (
              <div className="flex items-center gap-3">
                <a href={certificateUrl || undefined} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3">
                  <img src={certificateUrl || undefined} alt="Certificate" className="h-28 w-auto rounded border border-gray-200" />
                </a>
                {editMode && (
                  <Button
                    variant="outline"
                    className="border-red-300 !text-red-700 hover:!bg-red-50 hover:!text-red-800 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors"
                    leftIcon={<FiTrash2 className="text-red-600" />}
                    onClick={removeCertificate}
                    disabled={saving}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a
                  href={certificateUrl || undefined}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-4 bg-[#f5f5fc] text-blue-700 rounded-lg text-sm font-semibold"
                  rel="noreferrer"
                >
                  <LiaCertificateSolid className="text-blue-600 text-lg" />
                  View current certificate
                </a>
                {editMode && (
                  <Button
                    variant="outline"
                    className="border-red-300 !text-red-700 hover:!bg-red-50 hover:!text-red-800 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 transition-colors"
                    leftIcon={<FiTrash2 className="text-red-600" />}
                    onClick={removeCertificate}
                    disabled={saving}
                  >
                    Remove
                  </Button>
                )}
              </div>
            )
          ) : (
            <span className="text-gray-500">
              {serverCertOk === false ? "Certificate link unavailable on server. Please re-upload." : "No certificate uploaded."}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="file"
            multiple
            onChange={(e) => onPickCertificate(e.target.files)}
            className="block text-sm"
            accept="application/pdf,image/*"
            disabled={!editMode}
          />
          <Button onClick={onUploadCert} loading={saving} disabled={!editMode || !certFile} className="!text-black hover:!text-black">
            Upload Selected
          </Button>
          {!editMode && <span className="text-xs text-gray-500">Click Edit to manage certificates</span>}
        </div>
      </div>

      <div className={`rounded-2xl p-6 border shadow-sm ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"}`}>
        <div className="flex items-center gap-2 mb-2">
          <FiShield className={`text-xl ${isDark ? "text-gray-100" : "text-black"}`} />
          <h3 className={`text-xl font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Criminal Record</h3>
        </div>
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"} mb-3`}>
          Upload your latest criminal record certificate. We require a valid copy every six months.
        </p>
        {profile?.criminal_record_expiry_notice && (
          <p className={`text-sm mb-2 ${isCriminalExpired ? "text-red-600" : isDark ? "text-gray-300" : "text-gray-600"}`}>
            {profile.criminal_record_expiry_notice}
          </p>
        )}
        {profile?.criminal_record_uploaded_at && (
          <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs mb-4`}>
            Uploaded on {new Date(profile.criminal_record_uploaded_at).toLocaleString()}
          </p>
        )}

        {criminalPreviewUrl && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-600">Selected file:</span>
            <span className="text-sm font-medium text-gray-800">{criminalFile?.name}</span>
            <span className="text-xs text-gray-500">(not uploaded yet)</span>
          </div>
        )}

        {criminalRecordUrl && serverCriminalOk !== false ? (
          isImageUrl(criminalRecordUrl) ? (
            <div className="flex items-center gap-3 mb-4">
              <a href={criminalRecordUrl || undefined} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3">
                <img src={criminalRecordUrl || undefined} alt="Criminal record" className="h-28 w-auto rounded border border-gray-200" />
              </a>
              {editMode && (
                <Button
                  variant="outline"
                  className="border-red-300 !text-red-700 hover:!bg-red-50 hover:!text-red-800 hover:border-red-400"
                  leftIcon={<FiTrash2 className="text-red-600" />}
                  onClick={removeCriminalRecord}
                  disabled={criminalSaving}
                >
                  Remove
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-4">
              <a
                href={criminalRecordUrl || undefined}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-[#f5f5fc] text-blue-700 rounded-lg text-sm font-semibold"
              >
                <FiShield className="text-blue-600" />
                View current criminal record
              </a>
              {editMode && (
                <Button
                  variant="outline"
                  className="border-red-300 !text-red-700 hover:!bg-red-50 hover:!text-red-800 hover:border-red-400"
                  leftIcon={<FiTrash2 className="text-red-600" />}
                  onClick={removeCriminalRecord}
                  disabled={criminalSaving}
                >
                  Remove
                </Button>
              )}
            </div>
          )
        ) : (
          <span className="text-gray-500 text-sm">
            {serverCriminalOk === false ? "Criminal record link unavailable on server. Please re-upload." : "No criminal record uploaded."}
          </span>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => onPickCriminalRecord(e.target.files)}
            disabled={!editMode || criminalSaving}
            className="block"
          />
          <Button
            onClick={onUploadCriminalRecord}
            disabled={!editMode || !criminalFile || criminalSaving}
            loading={criminalSaving}
          >
            Upload Selected
          </Button>
        </div>
      </div>
    </div>
  );
}
