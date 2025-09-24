import { useEffect, useState } from "react";
import { CiLocationOn } from "react-icons/ci";
import { LuDollarSign } from "react-icons/lu";
import { MdOutlineWorkOutline } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import { FiEye, FiTv } from "react-icons/fi";
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
    <section className="pt-6">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Job Opportunities</h2>
            <div className="space-x-2 flex items-center">
              <button
                className={`flex items-center gap-2 px-4 py-1 font-semibold rounded-md border ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-100 hover:bg-gray-700'
                    : 'bg-blue-50 border-blue-200 text-gray-800 hover:bg-blue-100'
                }`}
              >
                <FiTv className="text-lg" />
                AI Job Search
              </button>
              <div className="w-64">
                <Input
                  placeholder="Search jobs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchJobs();
                  }}
                />
              </div>
              <Button variant="primary" onClick={fetchJobs}>Search</Button>
              {query.trim() !== "" && (
                <Button variant="secondary" onClick={() => { setQuery("");}}>All</Button>
              )}
            </div>
          </div>

          {loading && <div className="text-gray-600">Loading jobs...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && jobs.map((job) => (
            <div key={job.id} className="space-y-4">
              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-2xl p-6 border`} style={{ boxShadow: "0px 2px 2px 2px rgba(0, 0, 0, 0.08)" }}>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {job.title}
                    </h3>
                    {job.employer_company && (
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{job.employer_company}</p>
                    )}
                  </div>
                  {(job.has_applied || appliedIds.has(job.id)) ? (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-md">
                      Applied
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md">
                      New
                    </span>
                  )}
                </div>

              
                <div className={`grid grid-cols-2 gap-4 text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="flex items-center pt-6 gap-2">
                    <CiLocationOn className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdOutlineWorkOutline className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span>
                      {job.category}
                      {job.employment_type ? ` • ${job.employment_type}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuDollarSign className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span>
                      {job.currency} {job.budget}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoTimeOutline className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span>{formatTimeAgo(job.created_at)}</span>
                  </div>
                </div>

                <p className={`${isDark ? 'text-gray-200' : 'text-gray-800'} pt-4 mb-4 line-clamp-3`}>{job.description}</p>

                <div className="flex gap-3 items-center pt-4">
                  <Button
                    variant="outline"
                    className={`bg-transparent hover:!bg-transparent border border-gray-400 !text-black hover:!text-black dark:!text-black`}
                    leftIcon={<FiEye className="text-black" />}
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
    <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1 bg-white text-black rounded-lg p-4">
      <div className="pb-2 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-black">{selectedJob?.title}</h3>
        {selectedJob?.employer_company && (
          <p className="text-sm text-gray-500">at {selectedJob.employer_company}</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <CiLocationOn className="text-lg text-gray-500" />
          <span className="text-gray-700">{selectedJob?.location || '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdOutlineWorkOutline className="text-lg text-gray-500" />
          <span className="text-gray-700">{selectedJob?.category || '-'}</span>
        </div>
        {selectedJob?.employment_type && (
          <div className="flex items-center gap-2">
            <MdOutlineWorkOutline className="text-lg text-gray-500" />
            <span className="text-gray-700">{selectedJob.employment_type}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <LuDollarSign className="text-lg text-gray-500" />
          <span className="text-gray-700">
            {selectedJob?.currency} {selectedJob?.budget}
          </span>
        </div>
        {selectedJob?.created_at && (
          <div className="flex items-center gap-2">
            <IoTimeOutline className="text-lg text-gray-500" />
            <span className="text-gray-700">
              Posted {formatTimeAgo(selectedJob.created_at)}
            </span>
          </div>
        )}
        {selectedJob?.duration && (
          <div className="flex items-center gap-2">
            <IoTimeOutline className="text-lg text-gray-500" />
            <span className="text-gray-700">{selectedJob.duration}</span>
          </div>
        )}
        {typeof selectedJob?.applications_count === 'number' && (
          <div className="flex items-center gap-2">
            <FiEye className="text-lg text-gray-500" />
            <span className="text-gray-700">
              Applicants: {selectedJob.applications_count}
            </span>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-base font-semibold text-black mb-1">Job Description</h4>
        <div className="text-gray-800 whitespace-pre-line">
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
          >
            {appliedIds.has(selectedJob.id) ? 'Applied' : 'Apply Now'}
          </Button>
        </div>
      )}
    </div>
  )}
</Modal>





      {/* Application Form Modal */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title={applyJob ? `Apply for ${applyJob.title}` : 'Apply Now'} maxWidthClass="max-w-3xl">
        {applyJob && (
          <>
          <div className="space-y-4 text-gray-800 max-h-[55vh] overflow-y-auto pr-1">
            <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
              <div className="font-semibold text-black">{applyJob.title}</div>
              {applyJob.employer_company && (
                <div className="text-sm text-gray-600">{applyJob.employer_company}</div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                {applyJob.location} • {applyJob.category}
              </div>
            </div>

            {applyError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{applyError}</div>
            )}

           
            <div className=" pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Full Name" placeholder="Your full name" value={applyName} onChange={(e) => setApplyName(e.target.value)} />
              <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={applyEmail} onChange={(e) => setApplyEmail(e.target.value)} />
              <Input label="Location" autoComplete="address-level2" placeholder="City, Country" value={applyLocation} onChange={(e) => setApplyLocation(e.target.value)} />
            </div>

           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Years of Experience" type="number" inputMode="numeric" min="0" max="60" placeholder="e.g. 3" value={applyYears} onChange={(e) => setApplyYears(e.target.value)} />
              <Input label="Availability" placeholder="Immediate / 2 weeks / Date" value={applyAvailability} onChange={(e) => setApplyAvailability(e.target.value)} />
              <div>
                <span className="block mb-1 text-sm font-medium text-gray-700">Expected Rate</span>
                <div className="flex gap-2">
                  <Input className="flex-1" placeholder="Amount" inputMode="decimal" value={applyRate} onChange={(e) => setApplyRate(e.target.value)} />
                  <Input className="w-24" placeholder="Cur." value={applyCurrency} onChange={(e) => setApplyCurrency(e.target.value)} />
                </div>
              </div>
            </div>

           
            <div className="grid grid-cols-1 gap-3">
              <Input label="Resume / CV URL" placeholder="https://... (Google Drive, Dropbox, etc.)" value={applyResume} onChange={(e) => setApplyResume(e.target.value)} />
            </div>

          
            <Input label="Key Skills" placeholder="e.g. Plumbing, Electrical, HVAC" value={applySkills} onChange={(e) => setApplySkills(e.target.value)} />

        
            <label className="block">
              <span className="block mb-1 text-sm font-medium text-gray-700">Cover Letter</span>
              <textarea
                className="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                rows={8}
                placeholder="Write a concise, professional cover letter highlighting your fit, experience, and interest for this role."
                value={applyCover}
                onChange={(e) => setApplyCover(e.target.value)}
              />
              <div className="text-xs text-gray-500 mt-1">{applyCover.length}/1000</div>
            </label>

          </div>
            <div className="flex justify-end gap-2 pt-3">
              <Button variant="secondary" onClick={() => setApplyOpen(false)}>Cancel</Button>
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
              >
                Submit Application
              </Button>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}

export default AvailableJobs;
