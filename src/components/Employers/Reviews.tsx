import { useEffect, useMemo, useState } from "react";
import { TiStarFullOutline } from "react-icons/ti";
import { listTechnicians, createTechnicianReview } from "../../api/employers";
import { listTechnicianReviews, type ReviewItem } from "../../api/technicians";
import type { TechnicianMini } from "../../types/employer";
import Button from "../ui/Button";
import Input from "../ui/Input";

function Reviews() {
  const [technicians, setTechnicians] = useState<TechnicianMini[]>([]);
  const [techLoading, setTechLoading] = useState(true);
  const [techError, setTechError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setTechLoading(true);
      setTechError(null);
      try {
        const res = await listTechnicians({ page_size: 50 });
        setTechnicians(res.results ?? []);
        if ((res.results ?? []).length > 0) {
          setSelectedId((res.results ?? [])[0].id);
        }
      } catch (e: any) {
        setTechError(e?.message || "Failed to load technicians");
      } finally {
        setTechLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      if (!selectedId) {
        setReviews([]);
        return;
      }
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const res = await listTechnicianReviews(selectedId);
        setReviews(res ?? []);
      } catch (e: any) {
        setReviewsError(e?.message || "Failed to load reviews");
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [selectedId]);

  const filteredTechnicians = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return technicians;
    return technicians.filter((tech) => {
      const name = `${tech.first_name} ${tech.last_name}`.toLowerCase();
      const location = (tech.location || "").toLowerCase();
      return name.includes(term) || location.includes(term);
    });
  }, [search, technicians]);

  const selectedTechnician = useMemo(() => technicians.find((t) => t.id === selectedId) ?? null, [technicians, selectedId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedId) {
      setFormError("Select a technician to review");
      return;
    }
    if (!rating) {
      setFormError("Choose a rating");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      await createTechnicianReview(selectedId, { rating, comment: comment.trim() || undefined });
      setFormSuccess("Review submitted");
      setComment("");
      const res = await listTechnicianReviews(selectedId);
      setReviews(res ?? []);
    } catch (e: any) {
      setFormError(e?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row items-start gap-8 px-4 md:px-16 pb-12 dark:text-gray-100">
      <div className="flex-1 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-gray-100">Technician Reviews</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Share feedback with technicians you have worked with.</p>
          </div>
          <div className="w-full md:w-72">
            <Input
              placeholder="Search technicians by name or location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a review</h3>
          {techLoading ? (
            <div className="text-gray-600 dark:text-gray-300">Loading technicians...</div>
          ) : techError ? (
            <div className="text-red-600">{techError}</div>
          ) : technicians.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No technicians available yet.</div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Technician</label>
                <select
                  value={selectedId ?? ""}
                  onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filteredTechnicians.length === 0 && <option value="">No matches</option>}
                  {filteredTechnicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.first_name} {tech.last_name} - {tech.location || "Location unknown"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    const active = value <= rating;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="text-2xl"
                        aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                      >
                        <TiStarFullOutline className={active ? "text-yellow-400" : "text-gray-300"} />
                      </button>
                    );
                  })}
                  <span className="text-sm text-gray-500 dark:text-gray-400">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Comment (optional)</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share details about your experience"
                />
              </div>

              {formError && <p className="text-sm text-red-600">{formError}</p>}
              {formSuccess && <p className="text-sm text-green-600">{formSuccess}</p>}

              <div className="flex justify-end">
                <Button type="submit" loading={submitting}>Submit Review</Button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent feedback</h3>
            {selectedTechnician && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing reviews for {selectedTechnician.first_name} {selectedTechnician.last_name}
              </span>
            )}
          </div>

          {reviewsLoading ? (
            <div className="text-gray-600 dark:text-gray-300">Loading reviews...</div>
          ) : reviewsError ? (
            <div className="text-red-600">{reviewsError}</div>
          ) : !selectedId ? (
            <div className="text-gray-500 dark:text-gray-400">Select a technician to see feedback.</div>
          ) : reviews.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No reviews for this technician yet.</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877D3] text-white font-semibold">
                      {review.reviewer_username?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{review.reviewer_username || "Employer"}</span>
                      <div className="flex items-center gap-1 text-yellow-400 text-lg">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <TiStarFullOutline
                            key={index}
                            className={index < (review.rating || 0) ? "text-yellow-400" : "text-gray-300"}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reviews;
