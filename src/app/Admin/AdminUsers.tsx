import { useEffect, useState } from "react";
import { createAdminUser, deleteAdminUser, listAdminUsers, updateAdminUser, type AdminUser } from "../../api/admin";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

export default function AdminUsers({ embedded = false }: { embedded?: boolean }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<Partial<AdminUser> & { password?: string }>({ role: "technician", is_active: true } as any);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await listAdminUsers(q ? { search: q } : undefined);
      setUsers(res);
    } catch (e: any) { setError(e?.message || "Failed to load users"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ role: "technician", is_active: true } as any); setModalOpen(true); };
  const openEdit = (u: AdminUser) => { setEditing(u); setForm({ ...u, password: undefined }); setModalOpen(true); };
  const save = async () => {
    try {
      if (editing) await updateAdminUser(editing.id, form);
      else await createAdminUser(form);
      setModalOpen(false); await load();
    } catch (e: any) { alert(e?.message || "Failed to save"); }
  };
  const remove = async (u: AdminUser) => { if (!confirm(`Delete ${u.username}?`)) return; await deleteAdminUser(u.id); await load(); };
  const toggleActive = async (u: AdminUser) => {
    try {
      await updateAdminUser(u.id, { is_active: !u.is_active });
      await load();
    } catch (e: any) { alert(e?.message || "Failed to update status"); }
  };

  const content = (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">All Users</h2>
        <Button onClick={openNew}>New User</Button>
      </div>
      <div className="flex gap-2 mb-3">
        <Input placeholder="Search username/email/phone" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") load(); }} />
        <Button variant="outline" onClick={load}>Search</Button>
        <Button variant="secondary" onClick={() => { setQ(""); load(); }}>Show All</Button>
      </div>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-center">Role</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-left">Joined</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2">{(u.first_name || u.last_name) ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.username}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2 text-center">{u.role}</td>
                  <td className="px-3 py-2">{u.location || '-'}</td>
                  <td className="px-3 py-2 text-center">{u.is_active ? 'Approved' : 'Pending'}</td>
                  <td className="px-3 py-2">{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button
                      className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 text-gray-700 hover:bg-blue-50"
                      title="Edit"
                      onClick={() => openEdit(u)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 hover:bg-blue-50"
                      title={u.is_active ? 'Cancel' : 'Approve'}
                      onClick={() => toggleActive(u)}
                    >
                      {u.is_active ? <FiX className="text-red-600" /> : <FiCheck className="text-green-600" />}
                    </button>
                    <button
                      className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-300 text-red-600 hover:bg-red-50"
                      title="Delete"
                      onClick={() => remove(u)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr><td className="px-3 py-4 text-gray-500" colSpan={5}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${editing.username}` : "New user"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Username" value={form.username || ""} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <Input label="Email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="First name" value={form.first_name || ""} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Input label="Last name" value={form.last_name || ""} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <Input label="Role" value={form.role || ""} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <Input label="Phone" value={form.phone_number || ""} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
          <Input label="Location" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input label="Password" type="password" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </Modal>
    </div>
  );
  if (embedded) return content;
  return (
    <section className="pt-24 px-4 md:px-16 pb-12">
      <div className="max-w-7xl mx-auto">{content}</div>
    </section>
  );
}


