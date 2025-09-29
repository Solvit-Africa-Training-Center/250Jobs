import { useEffect, useState } from "react";
import { CiLocationOn } from "react-icons/ci";
import { LuDollarSign } from "react-icons/lu";
import { MdOutlineWorkOutline } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import { FiEye } from "react-icons/fi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { applyToJob, getJob, listJobs, myApplications } from "../../api/jobs";
import { useAuth } from "../../context/AuthContext";
import type { Job } from "../../types/job";
import Modal from "../../components/ui/Modal";
import { useTheme } from "../../context/ThemeContext";

function AvailableJobs() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [coverLetters, setCoverLetters] = useState<Record<number, string>>({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyForId, setApplyForId] = useState<number | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [applyCover, setApplyCover] = useState<string>("");
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applyName, setApplyName] = useState<string>("");
  const [applyEmail, setApplyEmail] = useState<string>("");
  const [applyLocation, setApplyLocation] = useState<string>("");
  const [applyYears, setApplyYears] = useState<string>("");
  const [applyAvailability, setApplyAvailability] = useState<string>("");
  const [applyRate, setApplyRate] = useState<string>("");
  const [applyCurrency, setApplyCurrency] = useState<string>("RWF");
  const [applyResume, setApplyResume] = useState<string>("");
  const [applySkills, setApplySkills] = useState<string>("");
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [flash, setFlash] = useState<Record<number, { kind: 'success' | 'error'; message: string }>>({});
  
  const cardSurfaceClass = isDark
    ? 'border border-gray-700 bg-gray-800 text-gray-100'
    : 'border border-gray-300 bg-white text-gray-900';
  const metaTextClass = isDark ? 'text-gray-300' : 'text-gray-600';
  const lightPrimaryActionClass = '!bg-[#1877D3] !text-white hover:!bg-[#145ea8] focus:!ring-2 focus:ring-[#9ec9f5]';
  const lightOutlineClass = '!bg-white !text-[#1877D3] !border !border-[#1877D3] hover:!bg-[#eef5ff] hover:!text-[#145ea8]';
  const metaIconClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const primaryActionClass = isDark
    ? '!bg-[#145ea8] !text-white hover:!bg-[#0f4c88] focus:!ring-2 focus:!ring-[#1e3a8a]'
    : '!bg-[#1877D3] !text-white hover:!bg-[#1361aa] focus:!ring-2 focus:ring-[#9ec9f5]';
  const outlineButtonClass = isDark
    ? '!bg-transparent !border-gray-500 !text-gray-100 hover:!bg-gray-800 hover:!text-gray-100'
    : '!bg-transparent !border-gray-400 !text-gray-800 hover:!bg-gray-50 hover:!text-gray-800';
  const detailPanelClass = isDark
    ? 'border border-gray-700 bg-gray-900 text-gray-100'
    : 'border border-gray-200 bg-white text-gray-900';
  const summaryCardClass = isDark
    ? 'border border-gray-700 bg-gray-800 text-gray-100'
    : 'border border-gray-200 bg-white text-gray-800';
  const detailLabelText = isDark ? 'text-gray-200' : 'text-gray-700';
  const detailMutedText = isDark ? 'text-gray-400' : 'text-gray-500';


  const applyModalTextClass = isDark ? 'text-gray-200' : 'text-gray-800';
  const applyModalBgClass = isDark ? 'bg-gray-900' : 'bg-white';
  const applyInputClass = isDark ? '!bg-gray-800 !text-gray-100 !border-gray-700' : '!bg-white !text-gray-900 !border-gray-300';
  const applyTextareaClass = isDark ? 'bg-gray-800 text-gray-100 border-gray-700 focus:ring-2 focus:ring-blue-500' : 'bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500';
  const applyLabelClass = isDark ? 'text-gray-200 font-medium' : 'text-gray-700 font-medium';


  const cancelButtonClass = isDark 
    ? '!bg-gray-700 !text-gray-100 hover:!bg-gray-600 !border !border-gray-600' 
    : '!bg-gray-100 !text-gray-700 hover:!bg-gray-200 !border !border-gray-300';
  
  const submitButtonClass = isDark 
    ? '!bg-blue-600 !text-white hover:!bg-blue-700' 
    : '!bg-blue-600 !text-white hover:!bg-blue-700';

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listJobs(query ? { search: query } : undefined);
      setJobs(res.results);
    } catch (err: any) {
      setError(err?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q === "") {
      fetchJobs();
    }
  }, [query]);

  useEffect(() => {
    let isCancelled = false;
    const loadApplied = async () => {
      try {
        const ids = new Set<number>();
        let page: number | undefined = 1;
       
        while (true) {
          const res = await myApplications(page, { page_size: 100 });
          for (const app of res.results) ids.add(app.job);
          if (!res.next) break;
          page = (page || 1) + 1;
        }
        if (!isCancelled) setAppliedIds(ids);
      } catch {
        // Ignore if unauthenticated or request fails; UI will still work for current session
      }
    };
    loadApplied();
    return () => {
      isCancelled = true;
    };
  }, []);

  const onApply = async (jobId: number, msgOverride?: string) => {
    setApplyingId(jobId);
    try {
      const msg = (msgOverride !== undefined ? msgOverride : coverLetters[jobId])?.trim();
      await applyToJob(jobId, msg || undefined);
      setFlash((m) => ({ ...m, [jobId]: { kind: 'success', message: 'Application submitted' } }));
      setTimeout(() => {
        setFlash((m) => {
          const next = { ...m };
          delete next[jobId];
          return next;
        });
      }, 3000);
      setCoverLetters((m) => ({ ...m, [jobId]: "" }));
      setAppliedIds((prev) => new Set(prev).add(jobId));
    } catch (err: any) {
      const msgText = err?.message || "Failed to apply";
      setFlash((m) => ({ ...m, [jobId]: { kind: 'error', message: msgText } }));
      setTimeout(() => {
        setFlash((m) => {
          const next = { ...m };
          delete next[jobId];
          return next;
        });
      }, 4000);
      if (/already applied/i.test(msgText)) {
        setAppliedIds((prev) => new Set(prev).add(jobId));
      }
    } finally {
      setApplyingId(null);
    }
  };

  const openApply = (job: Job) => {
    setApplyError(null);
    setApplyJob(job);
    setApplyForId(job.id);
    setApplyCover(coverLetters[job.id] || "");
    setApplyCurrency(job.currency || applyCurrency || "RWF");
    
    const fullName = [
      (user as any)?.first_name,
      (user as any)?.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
    setApplyName(fullName || user?.username || "");
    setApplyEmail(user?.email || "");
    setApplyLocation((user as any)?.location || "");
    setApplyOpen(true);
  };

  const onOpenDetails = async (jobId: number) => {
    setSelectedId(jobId);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const detail = await getJob(jobId);
      setSelectedJob(detail);
    } catch {
      setSelectedJob(null);
      setDetailError('Failed to load job details');
    } finally {
      setDetailLoading(false);
    }
  };

  const formatTimeAgo = (isoDate: string) => {
    const then = new Date(isoDate).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - then);
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (day > 0) return day === 1 ? "1 day ago" : `${day} days ago`;
    if (hr > 0) return hr === 1 ? "1 hour ago" : `${hr} hours ago`;
    if (min > 0) return min === 1 ? "1 minute ago" : `${min} minutes ago`;
    return "Just now";
  };

  return (
    <section className="pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-start gap-8">
        <div className="w-full space-y-6">
         
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Job Opportunities</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              {/* <button
                className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-md border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700'
                    : 'bg-blue-50 border-blue-200 text-gray-800 hover:bg-blue-100'
                }`}
              >
                <FiTv className="text-lg" />
                <span className="hidden sm:inline">AI Job Search</span>
              </button> */}
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:w-64 min-w-0"> 
                  <Input
                    className={`w-full ${isDark ? '!bg-gray-900 !text-gray-100 !border-gray-700' : '!bg-white !text-gray-900 !border-gray-300'}`}
                    placeholder="Search jobs..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchJobs();
                    }}
                  />
                </div>
                <Button variant="primary" onClick={fetchJobs} className="whitespace-nowrap">Search</Button>
                {query.trim() !== "" && (
                  <Button variant="secondary" onClick={() => { setQuery(""); }} className="whitespace-nowrap">All</Button>
                )}
              </div>
            </div>
          </div>

          {loading && <div className={metaTextClass}>Loading jobs...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && jobs.map((job) => (
            <div key={job.id} className="space-y-4">
              <div className={`${cardSurfaceClass} rounded-2xl p-4 sm:p-6 w-full`} style={{ boxShadow: "0px 2px 2px 2px rgba(0, 0, 0, 0.08)" }}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} truncate`}>
                      {job.title}
                    </h3>
                    {job.employer_company && (
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'} truncate`}>{job.employer_company}</p>
                    )}
                  </div>
                  {(job.has_applied || appliedIds.has(job.id)) ? (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-md whitespace-nowrap">
                      Applied
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md whitespace-nowrap">
                      New
                    </span>
                  )}
                </div>

             
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm ${metaTextClass} mb-4 mt-3`}>
                  <div className={`flex items-center gap-2 ${detailLabelText}`}>
                    <CiLocationOn className={`text-lg ${metaIconClass} flex-shrink-0`} />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${detailLabelText}`}>
                    <MdOutlineWorkOutline className={`text-lg ${metaIconClass} flex-shrink-0`} />
                    <span className="truncate">
                      {job.category}
                      {job.employment_type ? ` • ${job.employment_type}` : ""}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 ${detailLabelText}`}>
                    <LuDollarSign className={`text-lg ${metaIconClass} flex-shrink-0`} />
                    <span className="truncate">
                      {job.currency} {job.budget}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 ${detailLabelText}`}>
                    <IoTimeOutline className={`text-lg ${metaIconClass} flex-shrink-0`} />
                    <span className="truncate">{formatTimeAgo(job.created_at)}</span>
                  </div>
                </div>

                <p className={`${isDark ? 'text-gray-200' : 'text-gray-800'} mb-4 line-clamp-3`}>{job.description}</p>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center pt-4">
                  <Button
                    variant="outline"
                    className={`w-full sm:w-auto ${isDark ? outlineButtonClass : `${outlineButtonClass} ${lightOutlineClass}`}`}
                    leftIcon={<FiEye className={isDark ? 'text-gray-100' : 'text-gray-800'} />}
                    loading={selectedId === job.id && detailLoading}
                    onClick={() => onOpenDetails(job.id)}
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => openApply(job)}
                    loading={applyingId === job.id}
                    variant={appliedIds.has(job.id) ? "secondary" : "primary"}
                    disabled={appliedIds.has(job.id)}
                    className={`w-full sm:w-auto ${!appliedIds.has(job.id) ? (isDark ? primaryActionClass : lightPrimaryActionClass) : undefined}`}
                  >
                    {appliedIds.has(job.id) ? "Applied" : "Apply Now"}
                  </Button>
                </div>

                {flash[job.id] && (
                  <div
                    className={`mt-3 text-sm rounded-md px-3 py-2 border ${
                      flash[job.id].kind === 'success'
                        ? 'text-green-700 bg-green-50 border-green-200'
                        : 'text-red-700 bg-red-50 border-red-200'
                    }`}
                  >
                    {flash[job.id].message}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedJob?.title || "Job Details"}
        maxWidthClass="max-w-3xl"
      >
        {detailError && !detailLoading && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
            {detailError}
          </div>
        )}
        {!detailLoading && !detailError && (
          <div className={`${detailPanelClass} space-y-5 max-h-[65vh] overflow-y-auto rounded-lg p-4`}> 
            <div className={`pb-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-black'} break-words`}>{selectedJob?.title}</h3>
              {selectedJob?.employer_company && (
                <p className={`text-sm ${detailMutedText}`}>at {selectedJob.employer_company}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm"> 
              <div className={`flex items-center gap-2 ${detailLabelText}`}>
                <CiLocationOn className={`text-lg ${metaIconClass} flex-shrink-0`} />
                <span className={detailLabelText}>{selectedJob?.location || '-'}</span>
              </div>
              <div className={`flex items-center gap-2 ${detailLabelText}`}>
                <MdOutlineWorkOutline className={`text-lg ${metaIconClass} flex-shrink-0`} />
                <span className={detailLabelText}>{selectedJob?.category || '-'}</span>
              </div>
              {selectedJob?.employment_type && (
                <div className={`flex items-center gap-2 ${detailLabelText}`}>
                  <MdOutlineWorkOutline className={`text-lg ${metaIconClass} flex-shrink-0`} />
                  <span className={detailLabelText}>{selectedJob.employment_type}</span>
                </div>
              )}
              <div className={`flex items-center gap-2 ${detailLabelText}`}>
                <LuDollarSign className={`text-lg ${metaIconClass} flex-shrink-0`} />
                <span className={detailLabelText}>
                  {selectedJob?.currency} {selectedJob?.budget}
                </span>
              </div>
              {selectedJob?.created_at && (
                <div className={`flex items-center gap-2 ${detailLabelText}`}>
                  <IoTimeOutline className={`text-lg ${metaIconClass} flex-shrink-0`} />
                  <span className={detailLabelText}>
                    Posted {formatTimeAgo(selectedJob.created_at)}
                  </span>
                </div>
              )}
              {selectedJob?.duration && (
                <div className={`flex items-center gap-2 ${detailLabelText}`}>
                  <IoTimeOutline className={`text-lg ${metaIconClass} flex-shrink-0`} />
                  <span className={detailLabelText}>{selectedJob.duration}</span>
                </div>
              )}
              {typeof selectedJob?.applications_count === 'number' && (
                <div className={`flex items-center gap-2 ${detailLabelText}`}>
                  <FiEye className={`text-lg ${metaIconClass} flex-shrink-0`} />
                  <span className={detailLabelText}>
                    Applicants: {selectedJob.applications_count}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h4 className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-black'} mb-1`}>Job Description</h4>
              <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'} whitespace-pre-line break-words`}>
                {selectedJob?.description}
              </div>
            </div>

            {selectedJob && (
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => openApply(selectedJob)}
                  loading={applyingId === selectedJob.id}
                  variant={appliedIds.has(selectedJob.id) ? 'secondary' : 'primary'}
                  disabled={appliedIds.has(selectedJob.id)}
                  className={!appliedIds.has(selectedJob.id) ? (isDark ? primaryActionClass : lightPrimaryActionClass) : undefined}
                >
                  {appliedIds.has(selectedJob.id) ? 'Applied' : 'Apply Now'}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal 
        open={applyOpen} 
        onClose={() => setApplyOpen(false)} 
        title={applyJob ? `Apply for ${applyJob.title}` : 'Apply Now'} 
        maxWidthClass="max-w-3xl"
      >
        <div className={applyModalBgClass}>
          {applyJob && (
            <div className="flex flex-col h-full">
          
              <div className={`space-y-4 ${applyModalTextClass} overflow-y-auto flex-1 p-1`} style={{ maxHeight: '55vh' }}>
                <div className={`${isDark ? 'border border-gray-700 bg-gray-800' : 'border border-gray-200 bg-white'} rounded-lg p-3`}>
                  <div className={`${isDark ? 'text-gray-100' : 'text-black'} font-semibold break-words`}>{applyJob.title}</div>
                  {applyJob.employer_company && (
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{applyJob.employer_company}</div>
                  )}
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {applyJob.location} • {applyJob.category}
                  </div>
                </div>

                {applyError && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{applyError}</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`block mb-1 text-sm font-medium ${applyLabelClass}`}>Full Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={applyName}
                      onChange={(e) => setApplyName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${applyInputClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 text-sm font-medium ${applyLabelClass}`}>Email</label>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={applyEmail}
                      onChange={(e) => setApplyEmail(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${applyInputClass}`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block mb-1 text-sm font-medium ${applyLabelClass}`}>Location</label>
                    <input
                      type="text"
                      autoComplete="address-level2"
                      placeholder="City, Country"
                      value={applyLocation}
                      onChange={(e) => setApplyLocation(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${applyInputClass}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={`block mb-1 text-sm font-medium ${applyLabelClass}`}>Years of Experience</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="60"
                      placeholder="e.g. 3"
                      value={applyYears}
                      onChange={(e) => setApplyYears(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${applyInputClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 text-sm font-medium ${applyLabelClass}`}>Availability</label>
                    <input
                      type="text"
                      placeholder="Immediate / 2 weeks / Date"
                      value={applyAvailability}
                      onChange={(e) => setApplyAvailability(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${applyInputClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 text-sm font-medium ${applyLabelClass}`}>Expected Rate</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Amount"
                        value={applyRate}
                        onChange={(e) => setApplyRate(e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${applyInputClass}`}
                      />
                      <input
                        type="text"
                        placeholder="Cur."
                        value={applyCurrency}
                        onChange={(e) => setApplyCurrency(e.target.value)}
                        className={`w-20 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${applyInputClass}`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block mb-1 text-sm font-medium ${applyLabelClass}`}>Resume / CV URL</label>
                  <input
                    type="url"
                    placeholder="https://... (Google Drive, Dropbox, etc.)"
                    value={applyResume}
                    onChange={(e) => setApplyResume(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${applyInputClass}`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 text-sm font-medium ${applyLabelClass}`}>Key Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. Plumbing, Electrical, HVAC"
                    value={applySkills}
                    onChange={(e) => setApplySkills(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${applyInputClass}`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 text-sm font-medium ${applyLabelClass}`}>Cover Letter</label>
                  <textarea
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${applyTextareaClass}`}
                    rows={6}
                    placeholder="Write a concise, professional cover letter highlighting your fit, experience, and interest for this role."
                    value={applyCover}
                    onChange={(e) => setApplyCover(e.target.value)}
                  />
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{applyCover.length}/1000</div>
                </div>
              </div>

           
              <div className={` pt-13  border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4 mt-4 sticky bottom-0 ${applyModalBgClass} z-10`}>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => setApplyOpen(false)}
                    className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${cancelButtonClass}`}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!applyForId) return;
                      setApplyError(null);
                      
                      if (!applyName.trim()) { setApplyError('Please enter your full name.'); return; }
                      if (!applyEmail.trim()) { setApplyError('Please enter your email.'); return; }
                      if ((applyCover || '').trim().length < 60) { setApplyError('Cover letter is too short (min 60 characters).'); return; }
                      try {
                        const parts = [
                          applyCover.trim(),
                          "",
                          "---",
                          "Applicant Details:",
                          `Name: ${applyName}`,
                          `Email: ${applyEmail}`,
                          applyLocation ? `Location: ${applyLocation}` : "",
                          applyYears ? `Experience: ${applyYears} year(s)` : "",
                          applyAvailability ? `Availability: ${applyAvailability}` : "",
                          applyRate ? `Expected Rate: ${applyCurrency} ${applyRate}` : "",
                          applySkills ? `Skills: ${applySkills}` : "",
                          applyResume ? `Resume: ${applyResume}` : "",
                        ].filter(Boolean);
                        const finalMessage = parts.join("\n");
                        setCoverLetters((m) => ({ ...m, [applyForId]: finalMessage }));
                        await onApply(applyForId, finalMessage);
                        setApplyOpen(false);
                      } catch (e: any) {
                        setApplyError(e?.message || 'Failed to apply');
                      }
                    }}
                    loading={applyingId === applyForId}
                    className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${submitButtonClass}`}
                  >
                    Submit Application
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </section>
  );
}

export default AvailableJobs;