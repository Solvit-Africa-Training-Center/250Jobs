import { IoTimeOutline } from "react-icons/io5";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { GoXCircle } from "react-icons/go";
import { useEffect, useState } from "react";
import { myApplications, getJob } from "../../api/jobs";
import type { JobApplication, Paginated, Job } from "../../types/job";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useTheme } from "../../context/ThemeContext";
import { CiLocationOn } from "react-icons/ci";
import { MdOutlineWorkOutline } from "react-icons/md";
import { LuDollarSign } from "react-icons/lu";

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; label: string; icon?: JSX.Element }> = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
    SHORTLISTED: { bg: "bg-[#E7FFE2]", text: "text-[#278B8F]", label: "Shortlisted", icon: <IoMdCheckmarkCircleOutline className="text-2xl text-[#10CC5C]" /> },
    REJECTED: { bg: "bg-[#FFE2E2]", text: "text-[#9F075B]", label: "Rejected", icon: <GoXCircle className="text-2xl text-red-600" /> },
    HIRED: { bg: "bg-green-100", text: "text-green-700", label: "Hired", icon: <IoMdCheckmarkCircleOutline className="text-2xl text-green-600" /> },
  };
  const s = map[status] || map["PENDING"];
  return (
    <span className={`inline-flex items-center px-4 h-8 text-xs font-medium ${s.bg} ${s.text} rounded-2xl`}>
      {s.icon}
      <span className="ml-1">{s.label}</span>
    </span>
  );
}

function MyApplication() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Theme-aware classes
  const cardSurfaceClass = isDark
    ? "bg-gray-900 border border-gray-700 text-gray-100"
    : "bg-white border border-gray-300 text-gray-900";

  const modalSurfaceClass = isDark
    ? "bg-gray-900 text-gray-100"
    : "bg-white text-gray-900";

  const closeButtonClass = isDark ? "text-white" : "text-black";

  const mutedText = isDark ? "text-gray-400" : "text-gray-600";
  const detailMutedText = isDark ? "text-gray-400" : "text-gray-500";
  const detailStrongText = isDark ? "text-gray-100" : "text-gray-900";
  const detailIconClass = isDark ? "text-gray-400" : "text-gray-500";
  const detailBodyText = isDark ? "text-gray-200" : "text-gray-700";

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
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return withTime ? d.toLocaleString() : d.toLocaleDateString();
    } catch {
      return iso || "-";
    }
  };

  const getEmployerResponseAt = (app: JobApplication | null) => {
    if (!app) return null;
    if (app.status === "HIRED" && app.hired_at) return app.hired_at;
    if (app.status === "SHORTLISTED" && app.shortlisted_at) return app.shortlisted_at;
    if (app.status === "REJECTED") return app.shortlisted_at || app.hired_at || null;
    return null;
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

  const closeDetails = () => {
    setDetailOpen(false);
    setSelected(null);
    setJobDetail(null);
    setJobError(null);
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

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const employerResponseAt = getEmployerResponseAt(selected);

  return (
    <section className="pb-12">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold text-black">My Applications</h2>
          </div>

          {loading && <div className="h-6" />}
          {error && <div className="text-red-600">{error}</div>}

          {!loading &&
            !error &&
            data?.results.map((app) => (
              <div
                key={app.id}
                className={`${cardSurfaceClass} rounded-2xl p-6`}
                style={{ boxShadow: "0px 0px 0px 1px rgba(0, 0, 0, 0.08)" }}
                onClick={() => openDetails(app)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") openDetails(app);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`text-xl font-semibold ${detailStrongText}`}>
                      {app.job_title}
                    </h3>
                    <div className={`mt-1 text-sm ${mutedText} flex items-center gap-2`}>
                      <IoTimeOutline className={detailIconClass} />
                      {(() => {
                        const respondedAt = getEmployerResponseAt(app);
                        return respondedAt ? (
                          <span>Employer responded {fmtDate(respondedAt)}</span>
                        ) : (
                          <span>Employer response: -</span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="shrink-0">{statusBadge(app.status)}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <Modal
        open={detailOpen}
        onClose={closeDetails}
        title={selected ? selected.job_title : "Application details"}
        maxWidthClass="max-w-3xl"
        closeButtonClass={closeButtonClass} 
      >
        {selected ? (
          <div className={`space-y-6 rounded-2xl p-6 ${modalSurfaceClass}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h3 className={`text-xl font-semibold ${detailStrongText}`}>
                  {selected.job_title}
                </h3>
                <div className={`mt-1 text-sm ${detailMutedText} flex items-center gap-2`}>
                  <IoTimeOutline className={detailIconClass} />
                  <span>Applied {fmtDate(selected.created_at, true)}</span>
                </div>
              </div>
              <div className="shrink-0">{statusBadge(selected.status)}</div>
            </div>

            {employerResponseAt && (
              <div className={`text-xs ${detailMutedText} flex items-center gap-2`}>
                <IoTimeOutline className={detailIconClass} />
                <span>Employer responded on {fmtDate(employerResponseAt, true)}</span>
              </div>
            )}

            {jobLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              </div>
            )}

            {!jobLoading && jobError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {jobError}
              </div>
            )}

            {!jobLoading && !jobError && (
              <div className={`space-y-6 ${detailStrongText}`}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={`flex items-center gap-2 text-sm ${detailBodyText}`}>
                    <CiLocationOn className={`text-lg ${detailIconClass}`} />
                    <span>{jobDetail?.location || "Location not specified"}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${detailBodyText}`}>
                    <MdOutlineWorkOutline className={`text-lg ${detailIconClass}`} />
                    <span>{jobDetail?.employment_type || "Employment type not specified"}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${detailBodyText}`}>
                    <LuDollarSign className={`text-lg ${detailIconClass}`} />
                    <span>
                      {jobDetail?.budget
                        ? `${jobDetail.currency || "USD"} ${jobDetail.budget.toLocaleString()}`
                        : "Budget not provided"}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${detailBodyText}`}>
                    <IoTimeOutline className={`text-lg ${detailIconClass}`} />
                    <span>Posted {fmtDate(jobDetail?.created_at)}</span>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-semibold ${detailStrongText} uppercase tracking-wide`}>
                    Job Description
                  </h4>
                  <p
                    className={`mt-2 whitespace-pre-line text-sm leading-relaxed ${detailBodyText}`}
                  >
                    {jobDetail?.description || "No description provided."}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h4 className={`text-sm font-semibold ${detailStrongText} uppercase tracking-wide`}>
                Your Application
              </h4>
              <p
                className={`mt-2 whitespace-pre-line text-sm leading-relaxed ${detailBodyText}`}
              >
                {selected.cover_letter || "No cover letter included."}
              </p>
            </div>

          <div className="flex justify-end">
<Button
  variant="primary" 
  onClick={closeDetails}
  className="!bg-white !text-black dark:!bg-gray-900 dark:!text-white border border-gray-300 dark:border-gray-700 hover:!bg-gray-100 dark:hover:!bg-gray-800"
>
  Close
</Button>





</div>

          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Select an application to view its details.
          </div>
        )}
      </Modal>
    </section>
  );
}

export default MyApplication;
