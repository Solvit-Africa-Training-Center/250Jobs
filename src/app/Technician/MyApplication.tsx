
import { IoTimeOutline } from "react-icons/io5";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { GoXCircle } from "react-icons/go";
import { useEffect, useState } from "react";
import { myApplications } from "../../api/jobs";
import type { JobApplication, Paginated } from "../../types/job";

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; label: string; icon?: JSX.Element }> = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    SHORTLISTED: { bg: "bg-[#E7FFE2]", text: "text-[#278B8F]", label: "Shortlisted", icon: <IoMdCheckmarkCircleOutline className="text-2xl text-[#10CC5C]" /> },
    REJECTED: { bg: "bg-[#FFE2E2]", text: "text-[#9F075B]", label: "Rejected", icon: <GoXCircle className="text-2xl text-red-600" /> },
    HIRED: { bg: "bg-green-100", text: "text-green-700", label: "Hired", icon: <IoMdCheckmarkCircleOutline className="text-2xl text-green-600" /> },
  };
  const s = map[status] || map["PENDING"];
  return <span className={`inline-flex items-center px-4 h-8 text-xs font-medium ${s.bg} ${s.text} rounded-2xl`}>{s.icon}<span className="ml-1">{s.label}</span></span>;
}

function MyApplication() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<JobApplication> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await myApplications(p);
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page]);

  return (
    <section className="pb-12">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold text-black">My Applications</h2>
          </div>

          {loading && <div className="h-6" />}
          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && data?.results.map((app) => (
            <div key={app.id}
              className="bg-white rounded-2xl p-6 border border-gray-300"
              style={{ boxShadow: "0px 0px 0px 1px rgba(0, 0, 0, 0.08)" }}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{app.job_title}</h3>
                </div>
                {statusBadge(app.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <IoTimeOutline className="text-2xl text-gray-500" />
                  <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {app.cover_letter && (
                <p className="text-gray-800 bg-[#ECECF0] rounded-2xl p-4 mb-4">{app.cover_letter}</p>
              )}
            </div>
          ))}

          {/* Pagination controls removed as requested */}

        </div>
      </div>
    </section>
  );
}

export default MyApplication;
