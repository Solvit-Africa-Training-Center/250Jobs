import { TiStarOutline } from "react-icons/ti";
import { FiTv } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listTechnicians } from "../../api/employers";
import type { TechnicianMini, Paginated } from "../../types/employer";
import Input from "../ui/Input";
import Button from "../ui/Button";

function AvailableJobs() {
  const [data, setData] = useState<Paginated<TechnicianMini> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

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
    <section className="px-4 md:px-16 pb-12">
      <div className="max-full flex flex-col-reverse md:flex-row items-start gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Browse Technicians</h2>
            <div className="space-x-2 flex items-center">
              <button className="flex items-center gap-2 border bg-blue-50 border-blue-200 px-4 py-1 font-semibold rounded-md">
                <FiTv className="text-lg" />
                AI Technician finder
              </button>
              <div className="w-64"><Input placeholder="Search Technicians..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <Button variant="outline" onClick={fetchData}>Search</Button>
            </div>
          </div>

          {loading && <div className="text-gray-600">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {!loading && !error && (data?.results || []).map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-300">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#2984df] text-white text-xl font-bold mb-4 shadow-md">
                    {(t.first_name?.[0] || '')}{(t.last_name?.[0] || '')}
                  </div>
                  <h4 className="font-semibold text-black text-lg">{t.first_name} {t.last_name}</h4>
                  <div className="flex items-center gap-2 mt-4">
                    <IoLocationOutline className="text-2xl text-gray-500" />
                    <span className="text-gray-500 text-base">{t.location || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <TiStarOutline className="text-2xl text-orange-300" />
                    <span className="font-semibold text-black text-base">{t.rating_avg ?? 0} ({t.years_experience ?? 0} yrs)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(t.skills || []).slice(0, 4).map((s) => (
                      <span key={s.id} className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-black">{s.name}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4 mt-6">
                  <Link
                    to={`/employer/messages?recipient=${(t as any).user_id}`}
                    className="flex items-center justify-center gap-2 bg-[#2984df] px-6 py-2 rounded-md text-white font-bold"
                  >
                    <FaRegMessage /> Contact
                  </Link>
                  <button className="border border-gray-400 px-6 py-2 rounded-md text-black font-bold">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AvailableJobs;
