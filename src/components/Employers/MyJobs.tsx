import { CiLocationOn } from "react-icons/ci";
import { LuDollarSign } from "react-icons/lu";
import { IoTimeOutline } from "react-icons/io5";
import { FiEye, FiUsers } from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import { useEffect, useState } from "react";
import { myJobs, postJob, getMyJob, updateMyJob } from "../../api/employers";
import type { Job } from "../../types/job";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

function MyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<Job | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", location: "", budget: 0, currency: "RWF" });

  const primaryBtnClass = "!bg-[#1877D3] !text-white hover:!bg-[#1361aa] focus:!ring-2 focus:!ring-[#9ec9f5] dark:!bg-[#145ea8] dark:hover:!bg-[#0f4c88] dark:focus:!ring-[#1e3a8a]";

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await myJobs({ page_size: 50 });
      setJobs(res.results);
    } catch (e: any) {
      setError(e?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", category: "", location: "", budget: 0, currency: "RWF" });
    setFormOpen(true);
  };

  const openEdit = async (job: Job) => {
    setEditing(job);
    setForm({
      title: job.title,
      description: job.description,
      category: job.category,
      location: job.location,
      budget: job.budget,
      currency: job.currency,
    });
    setFormOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateMyJob(editing.id, form);
      } else {
        await postJob(form);
      }
      setFormOpen(false);
      await fetchJobs();
    } catch (e: any) {
      alert(e?.message || "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (id: number) => {
    try {
      const d = await getMyJob(id);
      setDetail(d);
      setDetailOpen(true);
    } catch (e: any) {
      alert(e?.message || "Failed to load job");
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row items-start gap-8 px-4 md:px-16 pb-12 dark:text-gray-100">
      <div className="flex-1 space-y-6">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold text-black dark:text-gray-100">Posted Jobs</h2>
          <div className="space-x-2 flex items-center">
            <Button className="flex items-center gap-2 !bg-[#1877D3] !text-white hover:!bg-[#1361aa] focus:!ring-2 focus:!ring-[#9ec9f5]" onClick={openCreate}>
              <MdAdd className="text-lg" />
              Post New Job
            </Button>
          </div>
        </div>

        {loading && <div className="text-gray-600 dark:text-gray-300">Loading jobs...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl p-6 transition border border-gray-300 dark:bg-gray-900 dark:border-gray-700" style={{ boxShadow: "0px 2px 2px 2px rgba(0, 0, 0, 0.08)" }}>
            <div className="flex justify-between">
              <h3 className="text-xl font-semibold text-gray-900 mb-1 dark:text-gray-100">{job.title}</h3>
              <p className="border border-gray-200 dark:border-gray-700 px-2 py-1 text-black font-semibold dark:text-gray-100 rounded-md text-sm">
                {job.is_active ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4 mt-2">
              <div className="flex items-center gap-2">
                <CiLocationOn className="text-lg text-gray-500 dark:text-gray-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <LuDollarSign className="text-lg text-gray-500 dark:text-gray-400" />
                <span>{job.currency} {job.budget}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoTimeOutline className="text-lg text-gray-500 dark:text-gray-400" />
                <span>{new Date(job.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUsers className="text-lg text-gray-500 dark:text-gray-400" />
                <span>{job.applications_count} applicants</span>
              </div>
            </div>

            <p className="text-gray-800 dark:text-gray-200 pt-2 mb-4 line-clamp-3">{job.description}</p>

            <div className="flex gap-3 items-center pt-2">
              <Button
                variant="outline"
                className="!text-black hover:!text-black bg-transparent hover:!bg-transparent border border-gray-400"
                leftIcon={<FiEye className="text-black dark:text-gray-100" />}
                onClick={() => openDetail(job.id)}
              >
                View Details
              </Button>
              <Button className={primaryBtnClass} onClick={() => openEdit(job)}>Edit Job</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Job" : "Post New Job"}>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          <Input label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          <Input label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <Input label="Budget" type="number" value={form.budget as any} onChange={(e) => setForm((f) => ({ ...f, budget: Number(e.target.value) }))} />
          <Input label="Currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Description</span>
            <textarea className="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300" rows={5} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <div className="pt-2">
            <Button type="submit" className={primaryBtnClass} loading={saving}>{editing ? "Save Changes" : "Create Job"}</Button>
          </div>
        </form>
      </Modal>

        <Modal
      open={detailOpen}
      onClose={() => setDetailOpen(false)}
      title={detail?.title || "Job Details"}
      maxWidthClass="max-w-4xl"
    >
      {detail ? (
        <div className="space-y-6 text-gray-700 dark:text-gray-200">
          <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">{detail.title}</h2>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1">
                    <CiLocationOn className="text-blue-500" />
                    {detail.location || "Location not provided"}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiUsers className="text-green-500" />
                    {detail.applications_count} applicants
                  </span>
                  <span className="flex items-center gap-1">
                    <IoTimeOutline className="text-gray-500 dark:text-gray-400" />
                    Posted {detail.created_at ? new Date(detail.created_at).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    detail.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {detail.is_active ? "Active" : "Inactive"}
                </span>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {detail.currency} {detail.budget}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Budget</div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Category</div>
              <div className="mt-1 font-semibold text-gray-900">{detail.category}</div>
            </div>
            {detail.employment_type && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Employment Type</div>
                <div className="mt-1 font-semibold text-gray-900">{detail.employment_type}</div>
              </div>
            )}
            {detail.duration && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                <div className="mt-1 font-semibold text-gray-900">{detail.duration}</div>
              </div>
            )}
            {detail.updated_at && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
                <div className="mt-1 font-semibold text-gray-900">
                  {new Date(detail.updated_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#1877D3]" />
              Job Description
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">
              {detail.description}
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <LuDollarSign className="text-green-600" />
                Compensation
              </h4>
              <div className="mt-2 space-y-1 text-sm">
                <div>Budget: {detail.currency} {detail.budget}</div>
                <div>Payment terms: {detail.payment_terms || "To be discussed"}</div>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              className={primaryBtnClass}
              onClick={() => setDetailOpen(false)}
            >
              Close
            </Button>
            <Button
              className={primaryBtnClass}
              onClick={() => {
                setDetailOpen(false);
                openEdit(detail);
              }}
            >
              Edit Job
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-gray-500 dark:text-gray-400">
          Loading job details...
        </div>
      )}
    </Modal>



    </div>
  );
}

export default MyJobs;





