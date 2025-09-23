import { useEffect, useMemo, useState } from "react";
import { LuCrown } from "react-icons/lu";
import { CiCalendar } from "react-icons/ci";
import AskedQuestions from "./AskedQuestions";
import { mySubscriptions, type SubscriptionItem } from "../../api/payments";

function CurrentSub() {
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await mySubscriptions();
        setItems(res || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load subscription");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const current = useMemo(() => {
    if (!items || items.length === 0) return null;
    const active = items.find((s) => s.status === "ACTIVE");
    return active || items[0];
  }, [items]);

  const fmtDate = (iso?: string) => {
    if (!iso) return "-";
    try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-10">

      {/* card 1: Current Subscription */}
      <div className="bg-white rounded-2xl p-6 transition border border-gray-300 w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <LuCrown className="text-blue-600 text-xl" />
          <h3 className="text-lg font-semibold">Current Subscription</h3>
        </div>

        {loading && <p className="text-gray-500 mb-5">Loading subscription...</p>}
        {error && <p className="text-red-600 mb-5">{error}</p>}
        {!loading && !current && !error && (
          <p className="text-gray-500 mb-5">No subscription yet. Choose a plan to get started.</p>
        )}

        {current && (
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">

          <div className="items-center gap-2">
            <p className="text-black font-bold">Plan</p>
            <div className="flex gap-3 pt-2">
              <p className="border border-gray-300 text-black px-2 py-0 rounded-md">{current.plan_name}</p>
              <p className={`px-2 py-0 rounded-md ${current.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{current.status.toLowerCase()}</p>
            </div>
          </div>

          <div className="items-center gap-2">
            <div className="flex">
              <span className="text-black font-semibold">Amount</span>
            </div>
            <p className="pt-2 text-black font-bold text-xl">{current.amount} {/** currency included in plan name usually */}</p>
          </div>

          <div className="items-center gap-2">
            <p className="text-black font-semibold">Next Billing Date</p>
            <div className="flex gap-2 pt-2">
              <CiCalendar className="text-lg text-gray-500" />
              <span>{fmtDate(current.end_date)}</span>
            </div>
          </div>

        </div>
        )}

        <div className="space-x-2">
          <button className="px-6 py-1 border border-gray-400 text-black rounded-md hover:bg-blue-100">
            Change Plan
          </button>
          <button className="px-6 py-1 border border-gray-400 text-black rounded-md hover:bg-blue-100">
            Update Payment
          </button>
          <button className="px-6 py-1 border border-gray-400 text-black rounded-md hover:bg-blue-100">
            Cancel Subscribution
          </button>
        </div>
      </div>

      {/* card 2: Usage Statistics */}
      <div className="bg-white rounded-2xl p-6 transition border border-gray-300 w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold">Usage Statistics</h3>
        </div>

        <p className="text-gray-500 mb-5">Your activity this month</p>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          
        </div>

        <div className="flex justify-between">
          <div className="space-x-2">
            <p className="text-3xl text-center text-blue-700 font-bold">12</p>
            <div className="flex justify-between">
              <p className="px-6 py-1 text-gray-600 text-sm rounded-md hover:bg-blue-100">
                Job Applications
              </p>
            </div>
          </div>

          <div className="space-x-2">
            <p className="text-3xl text-center text-blue-700 font-bold">8</p>
            <div className="flex justify-between">
              <p className="px-6 py-1 text-gray-600 text-sm rounded-md hover:bg-blue-100">
                Profile Views
              </p>
            </div>
          </div>

          <div className="space-x-2">
            <p className="text-3xl text-center text-blue-700 font-bold">3</p>
            <div className="flex justify-between">
              <p className="px-6 py-1 text-gray-600 text-sm rounded-md hover:bg-blue-100">
                Messages Sent
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asked Questions */}
      <AskedQuestions />

    </div>
  );
}

export default CurrentSub;
