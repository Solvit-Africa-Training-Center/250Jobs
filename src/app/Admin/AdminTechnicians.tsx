import { useEffect, useState } from "react";
import { approveTechnician, listAdminTechnicians, pauseTechnician, resumeTechnician, revokeTechnician, type AdminTechnician } from "../../api/admin";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function AdminTechnicians({ embedded = false }: { embedded?: boolean }) {
  const [items, setItems] = useState<AdminTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await listAdminTechnicians(q ? { search: q } : undefined);
      setItems(res);
    } catch (e: any) { setError(e?.message || "Failed to load technicians"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const doAction = async (id: number, fn: (id: number) => Promise<any>) => { try { await fn(id); await load(); } catch (e: any) { alert(e?.message || "Action failed"); } };

  const content = (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Technicians</h2>
      </div>
      <div className="flex gap-2 mb-3">
        <Input placeholder="Search username/email/location/skill" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") load(); }} />
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
              {items.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-3 py-2">{t.user_username}</td>
                  <td className="px-3 py-2">-</td>
                  <td className="px-3 py-2 text-center">technician</td>
                  <td className="px-3 py-2">{t.location || '-'}</td>
                  <td className="px-3 py-2 text-center">{t.is_paused ? 'Paused' : (t.is_approved ? 'Approved' : 'Pending')}</td>
                  <td className="px-3 py-2">-</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    {!t.is_approved && <Button variant="outline" onClick={() => doAction(t.id, approveTechnician)}>Approve</Button>}
                    {t.is_approved && <Button variant="outline" onClick={() => doAction(t.id, revokeTechnician)}>Cancel</Button>}
                    {!t.is_paused ? (
                      <Button variant="secondary" onClick={() => doAction(t.id, pauseTechnician)}>Pause</Button>
                    ) : (
                      <Button variant="secondary" onClick={() => doAction(t.id, resumeTechnician)}>Resume</Button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr><td className="px-3 py-4 text-gray-500" colSpan={5}>No technicians found.</td></tr>
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


