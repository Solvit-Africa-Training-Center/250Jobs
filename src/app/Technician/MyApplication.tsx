
import { IoTimeOutline } from "react-icons/io5";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { GoXCircle } from "react-icons/go";
import { useEffect, useState } from "react";
import { myApplications } from "../../api/jobs";
import type { JobApplication, Paginated } from "../../types/job";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { CiLocationOn } from "react-icons/ci";
import { MdOutlineWorkOutline } from "react-icons/md";
import { LuDollarSign } from "react-icons/lu";
import { getJob } from "../../api/jobs";
import type { Job } from "../../types/job";

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

//

function MyApplication() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<JobApplication> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [jobDetail, setJobDetail] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);

  const fmtDate = (iso?: string, withTime = false) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return withTime ? d.toLocaleString() : d.toLocaleDateString();
    } catch {
      return iso || "—";
    }
  };

  const openDetails = async (app: JobApplication) => {
    setSelected(app);
    setJobError(null);
    setJobDetail(null);
    setDetailOpen(true);
    try {
      setJobLoading(true);
      const detail = await getJob(app.job);
      setJobDetail(detail);
    } catch (e: any) {
      setJobError(e?.message || "Failed to load job details");
    } finally {
      setJobLoading(false);
    }
  };

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
            <div
              key={app.id}
              className={"bg-white rounded-2xl p-6 border border-gray-300"}
              style={{ boxShadow: "0px 0px 0px 1px rgba(0, 0, 0, 0.08)" }}
              onClick={() => openDetails(app)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') openDetails(app); }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{app.job_title}</h3>
                  <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                    <IoTimeOutline className="text-gray-500" /> Applied {fmtDate(app.created_at)}
                  </div>
                </div>
                <div className="shrink-0">{statusBadge(app.status)}</div>
              </div>

              {/* Link removed; entire card already opens details on click */}
            </div>
          ))}

          {/* Pagination controls removed as requested */}

        </div>
      </div>

      {/* Details view removed as requested */}
    </section>
  );
}

export default MyApplication;

