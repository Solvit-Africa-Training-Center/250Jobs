import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoTimeOutline } from "react-icons/io5";
import { CiStar } from "react-icons/ci";
import { FaRegMessage } from "react-icons/fa6";
import { GoVerified } from "react-icons/go";
import { MdOutlineCancel } from "react-icons/md";
import { FiExternalLink } from "react-icons/fi";
import { listApplicants, listTechnicians, setApplicantStatus, myJobs } from "../../api/employers";
import type { EmployerApplication, Paginated, TechnicianMini } from "../../types/employer";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-emerald-100 text-emerald-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const KEY_ALIASES: Record<string, string> = {
  "full name": "name",
  "applicant": "name",
  "applicant name": "name",
  "email address": "email",
  "contact email": "email",
  "location": "location",
  "city": "location",
  "experience": "experience",
  "years experience": "experience",
  "years of experience": "experience",
  "availability": "availability",
  "expected rate": "expected rate",
  "rate": "expected rate",
  "desired rate": "expected rate",
  "skills": "skills",
  "resume": "resume",
  "resume url": "resume",
  "resume / cv url": "resume",
  "cv url": "resume",
  "portfolio": "resume",
};

type ParsedApplicationMessage = {
  coverLetter: string;
  detailEntries: Array<{ key: string; label: string; value: string }>;
  resumeUrl?: string;
  extraSkills: string[];
};

type DetailItem = { label: string; value: string; type?: "email" | "url" };

type ApplicationMeta = {
  fullName: string;
  appliedDate: string;
  ratingDisplay: string;
  detailItems: DetailItem[];
  combinedSkills: string[];
  resumeUrl?: string;
};

type EmployerApplicationWithExtras = EmployerApplication & { job_title?: string };

function normalizeKey(label: string) {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function formatLabel(label: string) {
  const cleaned = label.replace(/[_-]+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseApplicationMessage(raw?: string | null): ParsedApplicationMessage {
  if (!raw) {
    return { coverLetter: "", detailEntries: [], extraSkills: [] };
  }

  const markerIndex = raw.indexOf("---");
  const coverLetter = (markerIndex >= 0 ? raw.slice(0, markerIndex) : raw).trim();
  const detailSegment = markerIndex >= 0 ? raw.slice(markerIndex + 3) : "";

  const lines = detailSegment
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const detailEntries: ParsedApplicationMessage["detailEntries"] = [];
  const extraSkills: string[] = [];
  let resumeUrl: string | undefined;

  for (const line of lines) {
    if (/^applicant details[:]?/i.test(line)) {
      continue;
    }
    const [labelPart, ...valueParts] = line.split(":");
    if (valueParts.length === 0) continue;

    const rawLabel = labelPart.trim();
    const value = valueParts.join(":").trim();
    if (!rawLabel || !value) continue;

    const normalized = KEY_ALIASES[normalizeKey(rawLabel)] ?? normalizeKey(rawLabel);

    if (normalized === "skills") {
      extraSkills.push(
        ...value
          .split(/[,;]/)
          .map((item) => item.trim())
          .filter(Boolean)
      );
      continue;
    }

    if (normalized === "resume") {
      resumeUrl = value;
      continue;
    }

    detailEntries.push({
      key: normalized,
      label: formatLabel(normalized === normalizeKey(rawLabel) ? rawLabel : normalized),
      value,
    });
  }

  return { coverLetter, detailEntries, resumeUrl, extraSkills };
}

function buildApplicationMeta(
  app: EmployerApplication,
  parsed: ParsedApplicationMessage
): ApplicationMeta {
  const detailMap = new Map<string, DetailItem>();

  for (const entry of parsed.detailEntries) {
    if (!detailMap.has(entry.key)) {
      detailMap.set(entry.key, {
        label: formatLabel(entry.label || entry.key),
        value: entry.value,
        type: entry.key === "email" ? "email" : undefined,
      });
    }
  }

  const fullName = `${app.technician_profile.first_name || ""} ${app.technician_profile.last_name || ""}`.trim();
  if (fullName && !detailMap.has("name")) {
    detailMap.set("name", { label: "Applicant", value: fullName });
  }

  const profileLocation = app.technician_profile.location;
  if (profileLocation && !detailMap.has("location")) {
    detailMap.set("location", { label: "Location", value: profileLocation });
  }

  const yearsExperience = app.technician_profile.years_experience;
  if (typeof yearsExperience === "number" && !detailMap.has("experience")) {
    const yearsText = `${yearsExperience} year${yearsExperience === 1 ? "" : "s"}`;
    detailMap.set("experience", { label: "Experience", value: yearsText });
  }

  const orderedKeys = [
    "name",
    "email",
    "location",
    "experience",
    "availability",
    "expected rate",
  ];

  const detailItems = Array.from(detailMap.entries())
    .sort((a, b) => {
      const ai = orderedKeys.indexOf(a[0]);
      const bi = orderedKeys.indexOf(b[0]);
      if (ai === -1 && bi === -1) return a[1].label.localeCompare(b[1].label);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    })
    .map(([, value]) => value);

  const combinedSkills = Array.from(
    new Set([
      ...(app.technician_profile.skills || []).map((s) => s.name).filter(Boolean),
      ...parsed.extraSkills,
    ])
  );

  const appliedDate = new Date(app.created_at).toLocaleDateString();
  const rawRating = app.technician_profile.rating_avg;
  const numericRating = typeof rawRating === "number" ? rawRating : rawRating ? parseFloat(String(rawRating)) : null;
  const ratingDisplay = Number.isFinite(numericRating) ? numericRating!.toFixed(1) : "--";

  return {
    fullName,
    appliedDate,
    ratingDisplay,
    detailItems,
    combinedSkills,
    resumeUrl: parsed.resumeUrl,
  };
}

function getJobLabel(app: EmployerApplication, titles: Record<number, string>) {
  const extras = app as EmployerApplicationWithExtras;
  return titles[app.job] || extras.job_title || `Job #${app.job}`;
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function Application() {
  const [data, setData] = useState<Paginated<EmployerApplication> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [q, setQ] = useState("");
  const [techs, setTechs] = useState<Paginated<TechnicianMini> | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [jobTitles, setJobTitles] = useState<Record<number, string>>({});
  const [viewingApp, setViewingApp] = useState<EmployerApplication | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listApplicants({ page_size: 50 });
        setData(res);
      } catch (error: unknown) {
        setError(toErrorMessage(error, "Failed to load applications"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await myJobs({ page_size: 200 });
        const map: Record<number, string> = {};
        for (const j of res.results) map[j.id] = j.title;
        setJobTitles(map);
      } catch {
        // silently ignore; UI will fall back to id
      }
    })();
  }, []);

  const runSearch = async () => {
    setSearching(true);
    setSearchError(null);
    try {
      const res = await listTechnicians(q ? { search: q, page_size: 12 } : { page_size: 12 });
      setTechs(res);
    } catch (error: unknown) {
      setSearchError(toErrorMessage(error, "Failed to search technicians"));
    } finally {
      setSearching(false);
    }
  };

  const updateStatus = async (
    id: number,
    status: "SHORTLISTED" | "REJECTED"
  ) => {
    try {
      await setApplicantStatus(id, status);
      setData((prev) =>
        prev
          ? {
              ...prev,
              results: prev.results.map((a) =>
                a.id === id ? { ...a, status } : a
              ),
            }
          : prev
      );
    } catch (error: unknown) {
      alert(toErrorMessage(error, "Failed to update status"));
    }
  };

  const viewingParsed = useMemo(() => {
    if (!viewingApp) return null;
    return parseApplicationMessage(viewingApp.cover_letter);
  }, [viewingApp]);

  const viewingMeta = useMemo(() => {
    if (!viewingApp || !viewingParsed) return null;
    return buildApplicationMeta(viewingApp, viewingParsed);
  }, [viewingApp, viewingParsed]);

  return (
    <section className="px-4 md:px-16 pb-12 ml-9  pt-6 ">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-start gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Job Applications</h2>
            <Button onClick={() => { setNewMsgOpen(true); setTechs(null); setQ(""); }}>New Message</Button>
          </div>

          {loading && <div className="text-gray-600">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {!loading &&
            !error &&
            data?.results.map((app) => {
              const parsed = parseApplicationMessage(app.cover_letter);
              const meta = buildApplicationMeta(app, parsed);
              const jobLabel = getJobLabel(app, jobTitles);
              const statusClass = STATUS_COLORS[app.status as keyof typeof STATUS_COLORS] ?? "bg-gray-100 text-gray-700";
              const coverPreview = parsed.coverLetter
                ? parsed.coverLetter.length > 280
                  ? `${parsed.coverLetter.slice(0, 280)}�`
                  : parsed.coverLetter
                : "";

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {meta.fullName || `Applicant #${app.technician}`}
                        </h3>
                        <span className={`inline-flex items-center px-3 h-7 text-xs font-semibold rounded-full ${statusClass}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied for {jobLabel} � {meta.appliedDate}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-2">
                          <IoTimeOutline className="text-lg text-gray-500" />
                          {meta.appliedDate}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <CiStar className="text-lg text-orange-400" />
                          {meta.ratingDisplay} rating
                        </span>
                        {app.technician_profile.location && (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-gray-400">|</span>
                            {app.technician_profile.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setViewingApp(app)}
                      >
                        View Application
                      </Button>
                    </div>
                  </div>

                  {coverPreview && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700">
                      {coverPreview}
                    </div>
                  )}

                  {meta.combinedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {meta.combinedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 text-sm border border-blue-200 bg-blue-50 text-blue-700 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 justify-end pt-2">
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      onClick={() => updateStatus(app.id, "SHORTLISTED")}
                    >
                      <GoVerified className="text-white" /> Accept
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-black border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                      onClick={() => updateStatus(app.id, "REJECTED")}
                    >
                      <MdOutlineCancel className="text-black" /> Cancel
                    </button>
                    <Link
                      className="flex items-center gap-2 px-4 py-2 text-black border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                      to={`/employer/messages?recipient=${app.technician}`}
                    >
                      <FaRegMessage className="text-black" /> Message
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <Modal
        open={Boolean(viewingApp && viewingParsed && viewingMeta)}
        onClose={() => setViewingApp(null)}
        title={viewingApp ? `Application � ${getJobLabel(viewingApp, jobTitles)}` : undefined}
        maxWidthClass="max-w-3xl"
      >
        {viewingApp && viewingParsed && viewingMeta ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-gray-900">{viewingMeta.fullName || `Applicant #${viewingApp.technician}`}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className={`inline-flex items-center px-3 h-7 text-xs font-semibold rounded-full ${
                  STATUS_COLORS[viewingApp.status as keyof typeof STATUS_COLORS] ?? "bg-gray-100 text-gray-700"
                }`}>
                  {viewingApp.status}
                </span>
                <span className="inline-flex items-center gap-2">
                  <IoTimeOutline className="text-lg text-gray-500" />
                  Applied {viewingMeta.appliedDate}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CiStar className="text-lg text-orange-400" />
                  {viewingMeta.ratingDisplay} rating
                </span>
                {viewingApp.technician_profile.location && (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-gray-400">|</span>
                    {viewingApp.technician_profile.location}
                  </span>
                )}
              </div>
            </div>

            <form className="space-y-6">
              {viewingMeta.detailItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingMeta.detailItems.map((item) => (
                    <Input
                      key={`${item.label}-${item.value}`}
                      label={item.label}
                      value={item.value}
                      readOnly
                      type={item.type === "email" ? "email" : item.type === "url" ? "url" : "text"}
                      className="cursor-text select-text"
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter</label>
                {viewingParsed.coverLetter ? (
                  <textarea
                    className="w-full min-h-[160px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 leading-relaxed"
                    value={viewingParsed.coverLetter}
                    readOnly
                  />
                ) : (
                  <p className="text-sm text-gray-500 italic">No cover letter provided.</p>
                )}
              </div>

              {viewingMeta.combinedSkills.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {viewingMeta.combinedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-sm border border-blue-200 bg-blue-50 text-blue-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingMeta.resumeUrl && (
                <div className="space-y-2">
                  <Input
                    label="Resume"
                    value={viewingMeta.resumeUrl}
                    readOnly
                    type="url"
                    className="cursor-text select-text"
                  />
                  {/https?:/i.test(viewingMeta.resumeUrl) ? (
                    <a
                      href={viewingMeta.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <FiExternalLink /> Open Resume
                    </a>
                  ) : null}
                </div>
              )}
            </form>
          </div>
        ) : null}
      </Modal>

      {/* New Message Modal */}
      <Modal open={newMsgOpen} onClose={() => setNewMsgOpen(false)} title="Start a new chat">
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="Search technicians"
                placeholder="Name, location, skill..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
              />
            </div>
            <Button variant="outline" onClick={runSearch} loading={searching}>Search</Button>
          </div>
          {searchError && <div className="text-sm text-red-600">{searchError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {(techs?.results || []).map((t: TechnicianMini, idx) => (
              <Link
                key={idx}
                to={`/employer/messages?recipient=${t.user_id}`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition"
                onClick={() => setNewMsgOpen(false)}
              >
                <div className="w-10 h-10 rounded-full bg-[#2984df] text-white font-bold flex items-center justify-center">
                  {(t.first_name?.[0] || '').toUpperCase()}{(t.last_name?.[0] || '').toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t.first_name} {t.last_name}</div>
                  <div className="text-xs text-gray-500">{t.location || '-'} - {t.years_experience ?? 0} yrs</div>
                </div>
                <span className="ml-auto text-sm text-blue-700">Message +</span>
              </Link>
            ))}
            {!searching && techs && techs.results.length === 0 && (
              <div className="text-sm text-gray-600">No results. Try another search.</div>
            )}
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default Application;
