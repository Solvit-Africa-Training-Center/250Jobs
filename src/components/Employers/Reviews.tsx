import { MdAdd } from "react-icons/md";
import { useState } from "react";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [reviewText, setReviewText] = useState("");

  const handleAddReview = () => {
    if (reviewText.trim() === "") return;
    setReviews([reviewText, ...reviews]);
    setReviewText("");
    setShowForm(false);
  };

  return (
    <div className="flex flex-col-reverse md:flex-row items-start gap-8 px-4 md:px-16 pb-12">
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black">Leave Reviews</h2>
          <button
            className="flex items-center gap-2 border bg-[#2984df] text-white border-blue-200 px-4 py-2 font-semibold rounded-md"
            onClick={() => setShowForm(!showForm)}
          >
            <MdAdd className="text-lg" />
            Write Review
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="flex flex-col gap-3">
            <textarea
              className="border border-gray-300 rounded-md p-2 w-full text-gray-700"
              rows={4}
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button
              className="self-end bg-[#2984df] text-white px-4 py-2 rounded-md font-semibold"
              onClick={handleAddReview}
            >
              Submit
            </button>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="border border-gray-300 rounded-lg p-6 text-gray-600 text-center text-base min-h-[100px] flex items-center justify-center">
            No reviews written yet. Work with technicians and leave reviews to help the community.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-4 text-gray-700 text-base"
              >
                {rev}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;
