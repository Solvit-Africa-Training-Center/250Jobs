import { useEffect, useState } from "react";
import { createAdminUser, deleteAdminUser, listAdminUsers, updateAdminUser, type AdminUser } from "../../api/admin";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiSearch, FiUserPlus, FiRefreshCw } from "react-icons/fi";
import { MdAdminPanelSettings, MdEngineering, MdPerson } from "react-icons/md";

export default function AdminUsers({ embedded = false }: { embedded?: boolean }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<Partial<AdminUser> & { password?: string }>({ role: "technician", is_active: true } as any);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); 
    setError(null);
    try {
      const res = await listAdminUsers(q ? { search: q } : undefined);
      setUsers(res);
    } catch (e: any) { 
      setError(e?.message || "Failed to load users"); 
    }
    finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { 
    setEditing(null); 
    setForm({ role: "technician", is_active: true } as any); 
    setModalOpen(true); 
  };

  const openEdit = (u: AdminUser) => { 
    setEditing(u); 
    setForm({ ...u, password: undefined }); 
    setModalOpen(true); 
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await updateAdminUser(editing.id, form);
      else await createAdminUser(form);
      setModalOpen(false); 
      await load();
    } catch (e: any) { 
      alert(e?.message || "Failed to save"); 
    } finally {
      setSaving(false);
    }
  };

  const remove = async (u: AdminUser) => { 
    if (!confirm(`Delete ${u.username}?`)) return; 
    await deleteAdminUser(u.id); 
    await load(); 
  };

  const toggleActive = async (u: AdminUser) => {
    try {
      await updateAdminUser(u.id, { is_active: !u.is_active });
      await load();
    } catch (e: any) { 
      alert(e?.message || "Failed to update status"); 
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <MdAdminPanelSettings className="text-purple-600" />;
      case 'technician': return <MdEngineering className="text-blue-600" />;
      default: return <MdPerson className="text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'technician': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const content = (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage users and their permissions</p>
        </div>
        <Button 
          onClick={openNew} 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <FiUserPlus className="text-lg" />
          Add New User
        </Button>
      </div>

  {/* Search and Filters */}
<div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
  <div className="flex flex-col sm:flex-row gap-3">
    <div className="flex-1 relative">
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input 
        placeholder="Search users by username, email, or phone..." 
        value={q} 
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") load(); }}
        className="pl-10"
      />
    </div>

    <div className="flex gap-2">
    <Button
  variant="outline"
  onClick={load}
  className="flex items-center gap-2 !text-black bg-transparent hover:bg-transparent hover:!text-white hover:shadow-none"
>
  <FiRefreshCw className={loading ? "animate-spin text-black" : "text-white"} />
  Refresh
</Button>


      <Button
        variant="secondary"
        onClick={() => { setQ(""); load(); }}
        className="!text-white hover:bg-transparent hover:shadow-none"
      >
        Clear
      </Button>
    </div>
  </div>
</div>


      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 mt-4">
            <div className="text-red-700 font-medium">{error}</div>
            <Button variant="outline" onClick={load} className="mt-2">Try Again</Button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
             <thead className="bg-gray-600">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">User</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Contact</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Role</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Joined</th>
    <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
  </tr>
</thead>

              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {u.first_name?.[0] || u.username?.[0] || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {(u.first_name || u.last_name) ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.username}
                          </div>
                          <div className="text-sm text-gray-500">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{u.email}</div>
                      <div className="text-sm text-gray-500">{u.phone_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(u.is_active)}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                          onClick={() => openEdit(u)}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                          onClick={() => toggleActive(u)}
                        >
                          {u.is_active ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          onClick={() => remove(u)}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {users.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No users found</div>
                <p className="text-gray-500 mt-2">Try adjusting your search or add a new user</p>
                <Button onClick={openNew} className="mt-4">Add First User</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${editing.username}` : "Add New User"} maxWidthClass="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Username" value={form.username || ""} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            <Input label="Email" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="First Name" value={form.first_name || ""} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input label="Last Name" value={form.last_name || ""} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select 
                value={form.role || ""} 
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              >
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Input label="Phone Number" value={form.phone_number || ""} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            <Input label="Location" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Input label="Password" type="password" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} 
                   placeholder={editing ? "Leave blank to keep current" : ""} />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active || false}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Active user account
            </label>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={save} loading={saving} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            {editing ? 'Update User' : 'Create User'}
          </Button>
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