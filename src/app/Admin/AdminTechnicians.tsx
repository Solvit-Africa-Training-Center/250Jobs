import { useEffect, useState } from "react";
import {
  approveTechnician,
  listAdminTechnicians,
  pauseTechnician,
  resumeTechnician,
  revokeTechnician,
  type AdminTechnician,
} from "../../api/admin";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { FiSearch, FiUserCheck, FiPause, FiPlay, FiUserX } from "react-icons/fi";
import { MdEngineering, MdPendingActions } from "react-icons/md";

export default function AdminTechnicians({ embedded = false }: { embedded?: boolean }) {
  const [items, setItems] = useState<AdminTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = async (query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminTechnicians(query ? { search: query } : undefined);
      setItems(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load technicians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const doAction = async (id: number, fn: (id: number) => Promise<any>) => {
    try {
      await fn(id);
      await load();
    } catch (e: any) {
      alert(e?.message || "Action failed");
    }
  };

  const getStatusColor = (tech: AdminTechnician) => {
    if (tech.is_paused) return "bg-yellow-100 text-yellow-800";
    if (tech.is_approved) return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusIcon = (tech: AdminTechnician) => {
    if (tech.is_paused) return <FiPause className="w-4 h-4" />;
    if (tech.is_approved) return <FiUserCheck className="w-4 h-4" />;
    return <MdPendingActions className="w-4 h-4" />;
  };

  const getStatusText = (tech: AdminTechnician) => {
    if (tech.is_paused) return "Paused";
    if (tech.is_approved) return "Approved";
    return "Pending";
  };

  const content = (
    <div className="space-y-6">
     
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Technician Management</h2>
          <p className="text-gray-600 mt-1">Manage technician accounts and approvals</p>
        </div>
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{items.length}</div>
          <div className="text-gray-600 text-sm">Total Technicians</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {items.filter((t) => t.is_approved && !t.is_paused).length}
          </div>
          <div className="text-gray-600 text-sm">Active</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {items.filter((t) => !t.is_approved).length}
          </div>
          <div className="text-gray-600 text-sm">Pending</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">
            {items.filter((t) => t.is_paused).length}
          </div>
          <div className="text-gray-600 text-sm">Paused</div>
        </div>
      </div>

      
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search technicians by username or skills..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") load(q);
              }}
              className="pl-10"
            />
          </div>
      <div className="flex gap-2">
  <Button
    variant="outline"
    onClick={() => load(q)}
    className="!text-black hover:!text-white hover:bg-black"
  >
    Search
  </Button>
  <Button
    variant="secondary"
    onClick={() => {
      setQ("");
      load("");
    }}
  >
    Clear
  </Button>
</div>


        </div>
      </div>

     
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 mt-4">
            <div className="text-red-700 font-medium">{error}</div>
            <Button variant="outline" onClick={() => load()} className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Technician
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <MdEngineering className="text-white w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{t.user_username}</div>
                          <div className="text-sm text-gray-500">Technician</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          t
                        )}`}
                      >
                        {getStatusIcon(t)}
                        {getStatusText(t)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <MdEngineering className="w-3 h-3" />
                        technician
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex flex-wrap gap-2 justify-end">
                      {!t.is_approved && (
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-3 py-1 flex items-center gap-1"
                          onClick={() => doAction(t.id, approveTechnician)}
                          title="Approve Technician"
                        >
                          <FiUserCheck className="w-4 h-4" />
                        </Button>
                      )}
                      {t.is_approved && (
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white rounded-full px-3 py-1 flex items-center gap-1"
                          onClick={() => doAction(t.id, revokeTechnician)}
                          title="Revoke Technician"
                        >
                          <FiUserX className="w-4 h-4" />
                        </Button>
                      )}
                      {!t.is_paused ? (
                        <Button
                          className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-full px-3 py-1 flex items-center gap-1"
                          onClick={() => doAction(t.id, pauseTechnician)}
                          title="Pause Technician"
                        >
                          <FiPause className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-1 flex items-center gap-1"
                          onClick={() => doAction(t.id, resumeTechnician)}
                          title="Resume Technician"
                        >
                          <FiPlay className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No technicians found</div>
                <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <section className="pt-24 px-4 md:px-16 pb-12">
      <div className="max-w-7xl mx-auto">{content}</div>
    </section>
  );
}
