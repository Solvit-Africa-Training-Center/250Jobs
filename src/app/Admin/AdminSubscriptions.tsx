import { useEffect, useState } from "react";
import { listAdminSubscriptions, type AdminSubscription } from "../../api/admin";
import {  FiDollarSign, FiCalendar, FiUser, FiPackage, FiTrendingUp } from "react-icons/fi";

export default function AdminSubscriptions({ embedded = false }: { embedded?: boolean }) {
  const [items, setItems] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        setItems(await listAdminSubscriptions());
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStatusClasses = (status: string) => {
    if (status.toLowerCase() === "active") {
      return "bg-green-100 text-green-800 border border-green-200";
    }
    if (status.toLowerCase() === "expired") {
      return "bg-red-100 text-red-800 border border-red-200";
    }
    if (status.toLowerCase() === "pending") {
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    }
    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    if (status.toLowerCase() === "active") {
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    }
    if (status.toLowerCase() === "expired") {
      return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    }
    return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
  };

  // Calculate statistics
  const totalRevenue = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const activeSubscriptions = items.filter(item => item.status.toLowerCase() === "active").length;
  const expiredSubscriptions = items.filter(item => item.status.toLowerCase() === "expired").length;

  const content = (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
          <p className="text-gray-600 mt-1">Manage all user subscription plans and statuses</p>
        </div>
       
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</div>
              <div className="text-blue-700 text-sm font-medium">Total Revenue</div>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <FiDollarSign className="text-white text-lg" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{activeSubscriptions}</div>
              <div className="text-green-700 text-sm font-medium">Active Subscriptions</div>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <FiTrendingUp className="text-white text-lg" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{expiredSubscriptions}</div>
              <div className="text-red-700 text-sm font-medium">Expired Subscriptions</div>
            </div>
            <div className="p-3 bg-red-500 rounded-lg">
              <FiCalendar className="text-white text-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading subscriptions...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-red-700 font-medium">Failed to load subscriptions</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      User
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FiPackage className="w-4 h-4" />
                      Plan
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2 justify-center">
                      <FiDollarSign className="w-4 h-4" />
                      Amount
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2 justify-center">
                      <FiCalendar className="w-4 h-4" />
                      Start Date
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2 justify-center">
                      <FiCalendar className="w-4 h-4" />
                      End Date
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {s.user_username?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{s.user_username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{s.plan_name}</div>
                      <div className="text-sm text-gray-500">Subscription Plan</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-green-600">${s.amount}</span>
                        <span className="text-xs text-gray-500">One-time</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(s.status)}`}
                        >
                          {getStatusIcon(s.status)}
                          {s.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900 font-medium">
                        {new Date(s.start_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(s.start_date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900 font-medium">
                        {new Date(s.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(s.end_date).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="text-gray-400 text-lg">No subscriptions found</div>
                      <p className="text-gray-500 mt-2">There are no subscription records available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <section className="pt-24 px-4 md:px-16 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">{content}</div>
    </section>
  );
}