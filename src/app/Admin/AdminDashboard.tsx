import { useEffect, useState } from "react";
import { FaUsers, FaRegClock, FaBriefcase, FaDollarSign } from "react-icons/fa";
import { getAnalyticsSummary, listAdminSubscriptions, type AdminSubscription } from "../../api/admin";
import AdminUsers from "./AdminUsers";
import AdminTechnicians from "./AdminTechnicians";
import AdminSubscriptions from "./AdminSubscriptions";
import { useTheme } from "../../context/ThemeContext";

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ total_users: number; posted_jobs: number; pending_approvals: number } | null>(null);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "technicians" | "subscriptions">("users");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [d, subs] = await Promise.all([
          getAnalyticsSummary(),
          listAdminSubscriptions()
        ]);
        setData({
          total_users: d.total_users,
          posted_jobs: d.posted_jobs,
          pending_approvals: d.pending_approvals,
        });
        setSubscriptions(subs);
      } catch (e: any) {
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalRevenue = subscriptions.reduce((sum, item) => sum + (item.amount || 0), 0);

  const stats = data
    ? [
        { label: "Total Users", value: data.total_users, icon: <FaUsers className="text-blue-400 w-8 h-8" /> },
        { label: "Pending Approval", value: data.pending_approvals, icon: <FaRegClock className="text-yellow-400 w-8 h-8" /> },
        { label: "Active Jobs", value: data.posted_jobs, icon: <FaBriefcase className="text-green-400 w-8 h-8" /> },
        { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: <FaDollarSign className="text-purple-400 w-8 h-8" /> },
      ]
    : [];

  return (
    <section
      className={`pt-24 px-4 pb-12 min-h-screen flex justify-center transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-[#F8FCFF]"
      }`}
    >
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Admin Dashboard</h1>
          <p className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-500"}`}>Platform management and oversight</p>
        </div>

        {loading && <div className={isDark ? "text-gray-300 text-center" : "text-gray-500 text-center"}>Loading…</div>}
        {error && <div className="text-red-600 text-center">{error}</div>}

        {data && (
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 flex-1 border ${
                  isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                }`}
              >
                <div className={`flex items-center justify-center w-14 h-14 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                  {stat.icon}
                </div>
                <div>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</div>
                  <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={`w-full flex items-center justify-between rounded-full p-1 mt-8 mb-6 ${isDark ? "bg-gray-700" : "bg-[#ECECF0]"}`}>
          {[
            { key: "users", label: "All Users" },
            { key: "technicians", label: "Technicians" },
            { key: "subscriptions", label: "Subscriptions" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex-1 mx-1 py-2 rounded-full font-semibold transition-colors duration-200 ${
                activeTab === t.key
                  ? isDark
                    ? "bg-gray-800 text-white shadow-sm"
                    : "bg-white text-black shadow-sm"
                  : isDark
                  ? "text-gray-300 hover:bg-gray-600 hover:text-white"
                  : "text-gray-600 hover:bg-white hover:text-black"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={`p-6 rounded-2xl shadow-md border transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
          {activeTab === "users" && <AdminUsers embedded />}
          {activeTab === "technicians" && <AdminTechnicians embedded />}
          {activeTab === "subscriptions" && <AdminSubscriptions embedded />}
        </div>
      </div>
    </section>
  );
}
