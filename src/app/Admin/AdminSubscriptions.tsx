import { useEffect, useState } from "react";
import { listAdminSubscriptions, type AdminSubscription } from "../../api/admin";

export default function AdminSubscriptions({ embedded = false }: { embedded?: boolean }) {
  const [items, setItems] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try { setItems(await listAdminSubscriptions()); } catch (e: any) { setError(e?.message || "Failed to load"); }
      finally { setLoading(false); }
    })();
  }, []);

  const content = (
    <div>
      <h2 className="text-xl font-semibold mb-4">Subscriptions</h2>
        {loading && <div>Loading…</div>}
        {error && <div className="text-red-600">{error}</div>}
        <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">User</th>
                <th className="px-3 py-2 text-left">Plan</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Start</th>
                <th className="px-3 py-2">End</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-3 py-2">{s.user_username}</td>
                  <td className="px-3 py-2">{s.plan_name}</td>
                  <td className="px-3 py-2 text-center">{s.amount}</td>
                  <td className="px-3 py-2 text-center">{s.status}</td>
                  <td className="px-3 py-2 text-center">{new Date(s.start_date).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-center">{new Date(s.end_date).toLocaleDateString()}</td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr><td className="px-3 py-4 text-gray-500" colSpan={6}>No subscriptions found.</td></tr>
              )}
            </tbody>
          </table>
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


