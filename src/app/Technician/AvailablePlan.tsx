import { useEffect, useMemo, useState } from "react";
import { FiUsers, FiCheck } from "react-icons/fi";
import { FaToggleOff } from "react-icons/fa6";
import AskedQuestions from "./AskedQuestions";
import { listPlans, initSubscribe, type Plan } from "../../api/payments";
import Button from "../../components/ui/Button";

export default function AvailablePlan() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const isYearly = cycle === "yearly";

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  // Load plans
  useEffect(() => {
    (async () => {
      try {
        setLoadingPlans(true);
        const res = await listPlans();
        setPlans(res);
      } catch (e: any) {
        setPlanError(e?.message || "Failed to load plans");
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, []);

  // Map plans by duration
  const planByMonths = useMemo(() => {
    const map: Record<number, Plan> = {};
    for (const p of plans) map[p.duration_months] = p;
    return map;
  }, [plans]);

  const onSubscribeByMonths = async (months: number) => {
    const p = planByMonths[months];
    if (!p) {
      alert("Plan not available yet. Please try again soon.");
      return;
    }
    setSubmittingId(p.id);
    try {
      const res = await initSubscribe(p.id);
      if (res?.checkout_url) window.location.href = res.checkout_url;
    } catch (e: any) {
      alert(e?.message || "Failed to start checkout");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* ===== Toggle Section ===== */}
      <div className="flex justify-center mt-10">
        <div className="flex items-center gap-4 bg-white rounded-full px-6 py-2 border border-gray-300 shadow-sm">
          <button
            onClick={() => setCycle("monthly")}
            className="font-semibold focus:outline-none"
          >
            <span className={isYearly ? "text-gray-500" : "text-black"}>
              Monthly
            </span>
          </button>

          <button
            aria-label="Toggle billing cycle"
            title="Toggle Monthly/Yearly"
            onClick={() => setCycle(isYearly ? "monthly" : "yearly")}
            className="focus:outline-none"
          >
            <FaToggleOff
              className={`text-3xl transition-transform ${
                isYearly ? "text-blue-500 rotate-180" : "text-gray-400"
              }`}
            />
          </button>

          <button
            onClick={() => setCycle("yearly")}
            className="font-semibold focus:outline-none flex items-center gap-2"
          >
            <span className={isYearly ? "text-black" : "text-gray-500"}>
              Yearly
            </span>
            <span className="text-xs bg-gray-200 text-black px-3 py-1 rounded-full font-semibold">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* ===== Plan Cards ===== */}
      <div className="mt-10 flex flex-wrap justify-center gap-8 px-4">
        {loadingPlans && <div className="text-gray-600">Loading plans...</div>}
        {planError && <div className="text-red-600">{planError}</div>}

        {/* ----- Free Plan ----- */}
        <div className="w-80 bg-white rounded-2xl h-[550px] p-6 border border-gray-300 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-center mb-3">
              <FiUsers className="text-2xl text-indigo-600 mx-auto mb-1" />
              <h3 className="text-lg font-semibold text-gray-900">Free</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 text-center">
              Perfect for getting started
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Free
            </h2>

            <p className="font-semibold text-gray-800 mb-2">Features included:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Basic profile creation
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Apply to 3 jobs per month
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Standard support
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Basic messaging
              </li>
            </ul>

            <p className="font-semibold text-gray-800 mt-4 mb-2">Limitations:</p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
              <li>Limited job applications</li>
              <li>No priority support</li>
              <li>Basic profile visibility</li>
            </ul>
          </div>

          <button className="mt-6 px-10 py-2 border text-black border-gray-400 rounded-lg hover:text-blue-800 text-sm font-medium hover:bg-blue-100 transition">
            Get Started
          </button>
        </div>

        {/* ----- Premium Plan ----- */}
        <div className="w-80 h-[580px] bg-white rounded-2xl p-6 border border-blue-700 shadow-lg flex flex-col justify-between -mt-4 -mb-4">
          <div>
            <div className="text-center mb-3">
              <FiUsers className="text-2xl text-indigo-600 mx-auto mb-1" />
              <h3 className="text-lg font-semibold text-gray-900">Premium</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 text-center">
              Best for active job seekers
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">
              {(planByMonths[1]?.currency || "RWF")}{" "}
              {Number(planByMonths[1]?.price || 0).toLocaleString()}
              <span className="text-gray-400 text-sm">/month</span>
            </h2>
            <p className="text-gray-400 mb-4 text-center">7-day free trial</p>

            <p className="font-semibold text-gray-800 mb-2">Features included:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Enhanced profile with portfolio
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Unlimited job applications
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Priority in search results
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Advanced messaging features
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Skills verification badge
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Application tracking
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Premium support
              </li>
            </ul>
          </div>

          <Button
            onClick={() => onSubscribeByMonths(1)}
            loading={submittingId === planByMonths[1]?.id}
          >
            Subscribe
          </Button>
        </div>

        {/* ----- 6-Month Plan ----- */}
        <div className="w-80 bg-white rounded-2xl p-6 border border-gray-300 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-center mb-3">
              <FiUsers className="text-2xl text-indigo-600 mx-auto mb-1" />
              <h3 className="text-lg font-semibold text-gray-900">
                {planByMonths[6]?.name || "6-Month Plan"}
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 text-center">
              Billed every 6 months
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">
              {(planByMonths[6]?.currency || "RWF")}{" "}
              {Number(planByMonths[6]?.price || 0).toLocaleString()}
            </h2>

            <p className="font-semibold text-gray-800 mb-2">Features included:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Everything in Monthly
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Better savings
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Priority support
              </li>
            </ul>
          </div>

          <Button
            className="mt-6"
            variant="outline"
            onClick={() => onSubscribeByMonths(6)}
            loading={submittingId === planByMonths[6]?.id}
          >
            Subscribe
          </Button>
        </div>

        {/* ----- Professional Plan ----- */}
        <div className="w-80 bg-white rounded-2xl h-[550px] p-6 border border-gray-300 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-center mb-3">
              <FiUsers className="text-2xl text-indigo-600 mx-auto mb-1" />
              <h3 className="text-lg font-semibold text-gray-900">Professional</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 text-center">
              For established professionals
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">
              {(planByMonths[12]?.currency || "RWF")}{" "}
              {Number(planByMonths[12]?.price || 0).toLocaleString()}
              <span className="text-gray-400 text-sm">/year</span>
            </h2>
            <p className="text-gray-400 mb-4 text-center">14-day free trial</p>

            <p className="font-semibold text-gray-800 mb-2">Features included:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Everything in Premium
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Featured profile placement
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Direct employer contact
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Portfolio showcase
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Analytics dashboard
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Custom profile URL
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Priority customer support
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" /> Certification showcase
              </li>
            </ul>
          </div>

          <Button
            className="mt-10"
            variant="outline"
            onClick={() => onSubscribeByMonths(12)}
            loading={submittingId === planByMonths[12]?.id}
          >
            Subscribe
          </Button>
        </div>
      </div>

      {/* ===== Feature Comparison ===== */}
      <div className="flex flex-col items-center p-6 mt-12 w-full">
        <h2 className="text-2xl font-bold text-center mb-6">
          Feature Comparison
        </h2>
        <div className="border border-gray-300 rounded-lg p-6 w-full max-w-4xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b border-gray-300">
                  <th className="p-3 font-medium text-black">Features</th>
                  <th className="p-3 font-medium text-black">Free</th>
                  <th className="p-3 font-medium text-black">Premium</th>
                  <th className="p-3 font-medium text-black">Professional</th>
                </tr>
              </thead>
              <tbody className="text-black">
                <tr className="border-b border-gray-300">
                  <td className="p-3">Profile Creation</td>
                  <td className="p-3 text-green-500">✓</td>
                  <td className="p-3 text-green-500">✓</td>
                  <td className="p-3 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3">Job Applications</td>
                  <td className="p-3 text-gray-500">Limited</td>
                  <td className="p-3 text-green-500">✓</td>
                  <td className="p-3 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3">Priority Support</td>
                  <td className="p-3 text-gray-400">-</td>
                  <td className="p-3 text-green-500">✓</td>
                  <td className="p-3 text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="p-3">Analytics Dashboard</td>
                  <td className="p-3 text-gray-400">-</td>
                  <td className="p-3 text-gray-400">-</td>
                  <td className="p-3 text-green-500">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <AskedQuestions />
      </div>
    </div>
  );
}
