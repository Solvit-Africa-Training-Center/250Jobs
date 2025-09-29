import { TiStarOutline } from "react-icons/ti";
import { FiTv } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listTechnicians } from "../../api/employers";
import type { TechnicianMini, Paginated } from "../../types/employer";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const resolveMediaUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  if (url.startsWith("/media/")) return url;
  if (url.startsWith("/")) return `/media${url}`;
  return `/media/${url}`;
};

const formatRating = (value: TechnicianMini["rating_avg"]) => {
  const numeric = value == null ? 0 : typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
};

function BrowserTech() {
  const navigate = useNavigate();
  const [data, setData] = useState<Paginated<TechnicianMini> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [selected, setSelected] = useState<TechnicianMini | null>(null);

  const loadTechnicians = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = search && search.trim() ? { search: search.trim() } : undefined;
      const res = await listTechnicians(params);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load technicians");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  const latestReview = useMemo(() => {
    if (!selected) return "";
    return (selected.latest_review_comment || "").trim();
  }, [selected]);

  return (
    <section className="px-4 md:px-16 pb-12 text-gray-900  ml-9  pt-6">
      <div className="max-full flex flex-col-reverse md:flex-row items-start gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-2xl font-bold">Browse Technicians</h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <button className="flex items-center gap-2 border bg-blue-50 border-blue-200 px-4 py-2 font-semibold rounded-md text-blue-700">
                <FiTv className="text-lg" />
                AI Technician Finder
              </button>
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search technicians..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") loadTechnicians(q);
                  }}
                />
              </div>
              <Button variant="outline" onClick={() => loadTechnicians(q)}>
                Search
              </Button>
            </div>
          </div>

          {loading && <div className="text-gray-600">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {!loading && !error && (data?.results || []).map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#2984df] text-white text-xl font-bold mb-4 shadow-md">
                    {(t.first_name?.[0] || "").toUpperCase()}{(t.last_name?.[0] || "").toUpperCase()}
                  </div>
                  <h4 className="font-semibold text-lg">{t.first_name} {t.last_name}</h4>
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                    <IoLocationOutline className="text-xl" />
                    <span>{t.location || "Location not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                    <TiStarOutline className="text-xl text-orange-400" />
                    <span className="font-semibold">{formatRating(t.rating_avg)} ({t.years_experience ?? 0} yrs)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center">
                    {(t.skills || []).slice(0, 4).map((s) => (
                      <span key={s.id} className="px-3 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 bg-gray-50">
                        {s.name}
                      </span>
                    ))}
                    {!(t.skills || []).length && <span className="text-xs text-gray-500">No skills listed yet.</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-3 mt-6">
                  <Button
                    className="flex items-center justify-center gap-2 !bg-[#1877D3] !text-white hover:!bg-[#1361aa]"
                    onClick={() => navigate(`/employer/messages?recipient=${t.user_id}`)}
                  >
                    <FaRegMessage /> Contact
                  </Button>
                  <Button
                    variant="outline"
                    className="border border-gray-400 !text-gray-800 hover:!bg-gray-100"
                    onClick={() => {
                      setSelected(t);
                      setProfileOpen(true);
                    }}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Modal
            open={profileOpen}
            onClose={() => {
              setProfileOpen(false);
              setSelected(null);
            }}
            title={selected ? `${selected.first_name} ${selected.last_name}` : "Technician Profile"}
            maxWidthClass="max-w-2xl"
          >
            {selected ? (
              <div className="space-y-5 text-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#1877D3] text-white text-xl font-semibold">
                    {(selected.first_name?.[0] || "").toUpperCase()}{(selected.last_name?.[0] || "").toUpperCase()}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{selected.first_name} {selected.last_name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <IoLocationOutline className="text-lg" />
                      <span>{selected.location || "Location not provided"}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Experience: {selected.years_experience ?? 0} year(s)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TiStarOutline className="text-xl text-orange-400" />
                  <span>
                    Rating: {formatRating(selected.rating_avg)} ({selected.rating_count ?? 0} review{(selected.rating_count ?? 0) === 1 ? "" : "s"})
                  </span>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">Bio</div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selected.bio?.trim() ? selected.bio.trim() : "No bio provided yet."}
                  </p>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">Top Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {(selected.skills || []).length > 0 ? (
                      selected.skills.map((s) => (
                        <span key={s.id} className="px-3 py-1 border border-gray-200 rounded-full text-sm bg-gray-50 text-gray-700">
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No skills listed yet.</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">Certificate</div>
                  {resolveMediaUrl(selected.certificates) ? (
                    <a
                      href={resolveMediaUrl(selected.certificates) || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold"
                    >
                      View certificate
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">No certificate uploaded.</span>
                  )}
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">Recent Employer Feedback</div>
                  <p className="text-sm text-gray-600">
                    {latestReview || "No employer reviews yet."}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button
                    variant="outline"
                    className="border border-gray-400 !text-gray-800 hover:!bg-gray-100"
                    onClick={() => {
                      setProfileOpen(false);
                      setSelected(null);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    className="!bg-[#1877D3] !text-white hover:!bg-[#1361aa]"
                    onClick={() => {
                      if (selected) navigate(`/employer/messages?recipient=${selected.user_id}`);
                    }}
                  >
                    Contact
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No technician selected.</div>
            )}
          </Modal>
        </div>
      </div>
    </section>
  );
}

export default BrowserTech;
