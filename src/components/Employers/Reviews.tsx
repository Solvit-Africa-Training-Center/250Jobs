import { MdAdd } from "react-icons/md";

function Reviews() {
  return (
    <div className="flex flex-col-reverse md:flex-row items-start gap-8 px-4 md:px-16 pb-12">
      <div className="flex-1 space-y-6">
       
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black">Leave Reviews</h2>
          <button className="flex items-center gap-2 border bg-[#2984df] text-white border-blue-200 px-4 py-2 font-semibold rounded-md">
            <MdAdd className="text-lg" />
            Write Review
          </button>
        </div>

     
        <div className="border border-gray-300 rounded-lg p-6 text-gray-600 text-center text-base min-h-[100px] flex items-center justify-center">
          No reviews written yet. Work with technicians and leave reviews to help the community.
        </div>
      </div>
    </div>
  );
}

export default Reviews;
