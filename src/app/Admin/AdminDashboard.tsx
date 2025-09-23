import { useEffect, useState } from "react";
import { getAnalyticsSummary } from "../../api/admin";
import AdminUsers from "./AdminUsers";
import AdminTechnicians from "./AdminTechnicians";
import AdminSubscriptions from "./AdminSubscriptions";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ total_users: number; posted_jobs: number; total_revenue: number; pending_approvals: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "technicians" | "subscriptions">("users");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await getAnalyticsSummary();
        setData(d);
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="pt-24 px-4 md:px-16 pb-12">
      <div className="max-w-7xl mx-auto">
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4"><div className="text-sm text-gray-500">Total Users</div><div className="text-2xl font-bold">{data.total_users}</div></div>
            <div className="bg-white border border-gray-200 rounded-xl p-4"><div className="text-sm text-gray-500">Pending Approval</div><div className="text-2xl font-bold">{data.pending_approvals}</div></div>
            <div className="bg-white border border-gray-200 rounded-xl p-4"><div className="text-sm text-gray-500">Active Jobs</div><div className="text-2xl font-bold">{data.posted_jobs}</div></div>
            <div className="bg-white border border-gray-200 rounded-xl p-4"><div className="text-sm text-gray-500">Total Revenue</div><div className="text-2xl font-bold">{data.total_revenue}</div></div>
          </div>
        )}

        {/* Short sidebar-like tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex gap-4">
            {[
              { key: "users", label: "All Users" },
              { key: "technicians", label: "Technicians" },
              { key: "subscriptions", label: "Subscriptions" },
            ].map((t) => (
              <button
                key={t.key}
                className={`px-3 py-2 -mb-px border-b-2 ${activeTab === (t.key as any) ? "border-blue-600 text-blue-700" : "border-transparent text-gray-600 hover:text-blue-700"}`}
                onClick={() => setActiveTab(t.key as any)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          {activeTab === "users" && <AdminUsers embedded />}
          {activeTab === "technicians" && <AdminTechnicians embedded />}
          {activeTab === "subscriptions" && <AdminSubscriptions embedded />}
        </div>
      </div>
    </section>
  );
}


