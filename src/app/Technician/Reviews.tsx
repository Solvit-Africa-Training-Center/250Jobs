import { TiStarFullOutline } from "react-icons/ti";
import { useEffect, useState } from "react";
import { getCurrentTechnician, listTechnicianReviews, type ReviewItem } from "../../api/technicians";

export default function Reviews() {
  const totalStars = 5;
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getCurrentTechnician();
        const items = await listTechnicianReviews(me.id);
        setReviews(items);
      } catch (e: any) {
        setError(e?.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-gray-600">Loading reviews...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 border border-gray-300 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-semibold text-gray-900">Reviews & Ratings</h3>
        </div>
        <p className="text-gray-500 mb-5">Feedback from employers you've worked with</p>

        <div className="flex flex-col">
          {reviews.length === 0 && (
            <p className="text-center text-gray-500 m-8">No reviews yet.</p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="px-4 py-4 text-gray-800 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <p className="w-10 h-10 flex items-center justify-center text-sm rounded-full bg-[#1877D3] text-white font-bold">
                  {r.reviewer_username?.slice(0, 2).toUpperCase()}
                </p>
                <div className="flex flex-col">
                  <p className="text-black font-bold">{r.reviewer_username}</p>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {Array.from({ length: totalStars }).map((_, index) => (
                      <TiStarFullOutline
                        key={index}
                        className={index < (r.rating || 0) ? "text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                    <span className="ml-2 text-xs text-gray-500">{r.rating}/5</span>
                  </div>
                </div>
                <p className="ml-auto text-gray-500">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <p className="mt-2 text-gray-700 text-sm">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
