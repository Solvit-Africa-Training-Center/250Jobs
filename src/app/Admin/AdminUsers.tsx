import { useEffect, useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  listAdminUsers as listUsers,
  createAdminUser as createUser,
  updateAdminUser as updateUser,
  deleteAdminUser as deleteUser,
  type AdminUser,
} from "../../api/admin";

export default function AdminUsers({
  embedded = false,
  isDark = false, 
}: {
  embedded?: boolean;
  isDark?: boolean;
}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<Partial<AdminUser>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listUsers();
        setUsers(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openAddModal = () => {
    setEditing(null);
    setForm({});
    setModalOpen(true);
  };

  const openEditModal = (user: AdminUser) => {
    setEditing(user);
    setForm(user);
    setModalOpen(true);
  };

  const save = async () => {
    try {
      setSaving(true);
      if (editing) {
        const updated = await updateUser(editing.id, form);
        setUsers(users.map((u) => (u.id === editing.id ? updated : u)));
      } else {
        const created = await createUser(form);
        setUsers([...users, created]);
      }
      setModalOpen(false);
    } catch (e: any) {
      alert(e?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (e: any) {
      alert(e?.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-800"
          }`}
        >
          All Users
        </h2>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg"
        >
          <FiUserPlus className="mr-2" /> Add New User
        </Button>
      </div>

      {loading && (
        <div
          className={`text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading...
        </div>
      )}
      {error && <div className="text-red-600 text-center">{error}</div>}

      {!loading && users.length === 0 && (
        <div
          className={`text-center italic ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          No users found.
        </div>
      )}

      {users.length > 0 && (
        <table
          className={`min-w-full border rounded-xl overflow-hidden ${
            isDark ? "border-gray-700" : "border-gray-300"
          }`}
        >
          <thead
            className={isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100"}
          >
            <tr>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={isDark ? "divide-y divide-gray-700" : "divide-y divide-gray-300"}>
            {users.map((user) => (
              <tr
                key={user.id}
                className={isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"}
              >
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3">
                  {user.is_active ? "✅" : "❌"}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => openEditModal(user)}
                    className={
                      isDark
                        ? "border-gray-500 text-gray-200 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => remove(user.id)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <div className="flex items-center gap-3">
            <div
              className={
                isDark
                  ? "p-2 bg-gray-700 rounded-lg"
                  : "p-2 bg-blue-100 rounded-lg"
              }
            >
              <FiUserPlus
                className={
                  isDark ? "text-blue-400 text-xl" : "text-blue-600 text-xl"
                }
              />
            </div>
            <div>
              <div
                className={
                  isDark
                    ? "text-xl font-bold text-white"
                    : "text-xl font-bold text-gray-900"
                }
              >
                {editing ? `Edit ${editing.username}` : "Add New User"}
              </div>
              <div
                className={
                  isDark ? "text-sm text-gray-300" : "text-sm text-gray-600"
                }
              >
                {editing
                  ? "Update user information"
                  : "Create a new user account"}
              </div>
            </div>
          </div>
        }
        maxWidthClass="max-w-4xl"
      >
        <div
          className={
            isDark
              ? "space-y-6 bg-gray-800 p-6 rounded-xl text-white"
              : "space-y-6 bg-white p-6 rounded-xl text-gray-900"
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Input
  label="Username"
  value={form.username || ""}
  onChange={(e) => setForm({ ...form, username: e.target.value })}
  className="rounded-xl"
  required
/>

            <Input
              label="Email"
              type="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={
                isDark
                  ? "bg-gray-700 text-white rounded-xl"
                  : "bg-gray-50 text-gray-900 rounded-xl"
              }
              required
            />
            <div>
              <label
                className={
                  isDark
                    ? "block text-sm font-medium text-gray-200 mb-2"
                    : "block text-sm font-medium text-gray-700 mb-2"
                }
              >
                Role
              </label>
              <select
                value={form.role || ""}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={
                  isDark
                    ? "w-full bg-gray-700 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    : "w-full bg-gray-50 text-gray-900 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                }
              >
                <option value="technician">Technician</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div
            className={
              isDark
                ? "flex items-center p-4 bg-gray-700 rounded-xl"
                : "flex items-center p-4 bg-gray-50 rounded-xl"
            }
          >
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active || false}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is_active"
              className={isDark ? "ml-3 text-sm text-gray-200" : "ml-3 text-sm text-gray-700"}
            >
              Active user account (user can login and access the system)
            </label>
          </div>
        </div>

        <div
          className={
            isDark
              ? "mt-8 flex justify-end gap-3 border-t border-gray-700 pt-6"
              : "mt-8 flex justify-end gap-3 border-t border-gray-300 pt-6"
          }
        >
          <Button
            variant="outline"
            onClick={() => setModalOpen(false)}
            className={
              isDark
                ? "border-gray-500 text-gray-200 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }
          >
            Cancel
          </Button>
          <Button
            onClick={save}
            loading={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
          >
            {editing ? "Update User" : "Create User"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}





