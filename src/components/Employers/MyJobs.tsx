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
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    budget: 0,
    currency: "RWF",
  });

  const primaryBtnClass =
    "!bg-[#1877D3] !text-white hover:!bg-[#1361aa] focus:!ring-2 focus:!ring-[#9ec9f5]";

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

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      category: "",
      location: "",
      budget: 0,
      currency: "RWF",
    });
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
    <div className=" pt-6 ml-9 flex flex-col-reverse md:flex-row items-start gap-8 px-4 md:px-16 pb-12 text-black">
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Posted Jobs</h2>
          <Button
            className="flex items-center gap-2 bg-[#1877D3] text-white hover:bg-[#1361aa] focus:ring-2 focus:ring-[#9ec9f5]"
            onClick={openCreate}
          >
            <MdAdd className="text-lg" />
            Post New Job
          </Button>
        </div>

        {loading && <div className="text-gray-600">Loading jobs...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading &&
          !error &&
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 border border-gray-300 shadow-sm"
            >
              <div className="flex justify-between">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {job.title}
                </h3>
                <p className="border border-gray-200 px-2 py-1 text-gray-900 font-semibold rounded-md text-sm">
                  {job.is_active ? "Active" : "Inactive"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4 mt-2">
                <div className="flex items-center gap-2">
                  <CiLocationOn className="text-lg text-gray-500" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LuDollarSign className="text-lg text-gray-500" />
                  <span>
                    {job.currency} {job.budget}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IoTimeOutline className="text-lg text-gray-500" />
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="text-lg text-gray-500" />
                  <span>{job.applications_count} applicants</span>
                </div>
              </div>

              <p className="text-gray-800 pt-2 mb-4 line-clamp-3">
                {job.description}
              </p>

              <div className="flex gap-3 items-center pt-2">
               
                <Button className={primaryBtnClass} onClick={() => openEdit(job)}>
                  Edit Job
                </Button>
              </div>
            </div>
          ))}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Job" : "Post New Job"}
      >
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input
            label="Title"
            value={form.title}
            onChange={(e) =>
              setForm((f) => ({ ...f, title: e.target.value }))
            }
            required
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
          />
          <Input
            label="Budget"
            type="number"
            value={form.budget as any}
            onChange={(e) =>
              setForm((f) => ({ ...f, budget: Number(e.target.value) }))
            }
          />
          <Input
            label="Currency"
            value={form.currency}
            onChange={(e) =>
              setForm((f) => ({ ...f, currency: e.target.value }))
            }
          />
          <label className="block">
            <span className="block mb-1 text-sm font-medium text-gray-700">
              Description
            </span>
            <textarea
              className="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>
          <div className="pt-2">
            <Button type="submit" className={primaryBtnClass} loading={saving}>
              {editing ? "Save Changes" : "Create Job"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MyJobs;
