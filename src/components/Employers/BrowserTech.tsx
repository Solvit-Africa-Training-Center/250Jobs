import { TiStarOutline } from "react-icons/ti";
import { FiTv } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listTechnicians } from "../../api/employers";
import type { TechnicianMini, Paginated } from "../../types/employer";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

function AvailableJobs() {
  const navigate = useNavigate();
  const [data, setData] = useState<Paginated<TechnicianMini> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [selected, setSelected] = useState<TechnicianMini | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listTechnicians(q ? { search: q } : undefined);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load technicians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <section className="px-4 md:px-16 pb-12 dark:text-gray-100">
      <div className="max-full flex flex-col-reverse md:flex-row items-start gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black dark:text-gray-100">Browse Technicians</h2>
            <div className="space-x-2 flex items-center">
              <button className="flex items-center gap-2 border bg-blue-50 border-blue-200 px-4 py-1 font-semibold rounded-md dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-100">
                <FiTv className="text-lg" />
                AI Technician finder
              </button>
              <div className="w-64"><Input placeholder="Search Technicians..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <Button variant="outline" className="dark:border-gray-600 dark:!text-gray-100" onClick={fetchData}>Search</Button>
            </div>
          </div>

          {loading && <div className="text-gray-600 dark:text-gray-300">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {!loading && !error && (data?.results || []).map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-300 dark:bg-gray-900 dark:border-gray-700">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#2984df] text-white text-xl font-bold mb-4 shadow-md dark:bg-[#1b5aa8]">
                    {(t.first_name?.[0] || '')}{(t.last_name?.[0] || '')}
                  </div>
                  <h4 className="font-semibold text-black text-lg dark:text-gray-100">{t.first_name} {t.last_name}</h4>
                  <div className="flex items-center gap-2 mt-4">
                    <IoLocationOutline className="text-2xl text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-500 text-base dark:text-gray-300">{t.location || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <TiStarOutline className="text-2xl text-orange-300" />
                    <span className="font-semibold text-black text-base dark:text-gray-100">{t.rating_avg ?? 0} ({t.years_experience ?? 0} yrs)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(t.skills || []).slice(0, 4).map((s) => (
                      <span key={s.id} className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-black dark:border-gray-600 dark:text-gray-100">{s.name}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4 mt-6">
                  <Button
                    className="flex items-center justify-center gap-2 !bg-[#1877D3] !text-white hover:!bg-[#1361aa] dark:!bg-[#145ea8] dark:hover:!bg-[#0f4c88]"
                    onClick={() => navigate(`/employer/messages?recipient=${t.user_id}`)}
                  >
                    <FaRegMessage /> Contact
                  </Button>
                  <Button
                    variant="outline"
                    className="border border-gray-400 !text-black hover:!text-black bg-transparent hover:!bg-gray-100 dark:border-gray-600 dark:!text-gray-100 dark:hover:!bg-gray-800"
                    onClick={() => { setSelected(t); setProfileOpen(true); }}
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
          <div className="space-y-4 text-gray-700 dark:text-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#1877D3] text-white text-xl font-semibold dark:bg-[#145ea8]">
                {(selected.first_name?.[0] || "").toUpperCase()}{(selected.last_name?.[0] || "").toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selected.first_name} {selected.last_name}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2 dark:text-gray-300">
                  <IoLocationOutline className="text-lg" />
                  <span>{selected.location || "Location not provided"}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  Experience: {selected.years_experience ?? 0} year(s)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <TiStarOutline className="text-xl text-orange-300" />
              <span>
                Rating: {selected.rating_avg ?? 0} ({selected.rating_count ?? 0} review{(selected.rating_count ?? 0) === 1 ? "" : "s"})
              </span>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2 dark:text-gray-100">Top Skills</div>
              <div className="flex flex-wrap gap-2">
                {(selected.skills || []).length > 0 ? (
                  selected.skills.map((s) => (
                    <span key={s.id} className="px-3 py-1 border border-gray-200 rounded-full text-sm bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                      {s.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">No skills listed yet.</span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                className="border border-gray-400 !text-black hover:!text-black bg-transparent hover:!bg-gray-100 dark:border-gray-600 dark:!text-gray-100 dark:hover:!bg-gray-800"
                onClick={() => {
                  setProfileOpen(false);
                  setSelected(null);
                }}
              >
                Close
              </Button>
              <Button
                className="!bg-[#1877D3] !text-white hover:!bg-[#1361aa] dark:!bg-[#145ea8] dark:hover:!bg-[#0f4c88]"
                onClick={() => {
                  if (selected) navigate(`/employer/messages?recipient=${selected.user_id}`);
                }}
              >
                Contact
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">No technician selected.</div>
        )}
      </Modal>
        </div>
      </div>
    </section>
  );
}

export default AvailableJobs;
