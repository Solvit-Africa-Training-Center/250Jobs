function AskedQuestions() {
  return (
    <div className="flex justify-center pt-8">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-300 min-h-[140px]">
            <h4 className="font-semibold text-md text-black mb-3">
              Can I change my plan anytime?
            </h4>
            <p className="text-gray-600 text-sm">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </p>
          </div>

         
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-300 min-h-[140px]">
            <h4 className="font-semibold text-md text-black mb-3">
              What happens during the free trial?
            </h4>
            <p className="text-gray-600 text-sm">
              You get full access to all premium features during your trial. You can cancel anytime before the trial ends.
            </p>
          </div>

         
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-300 min-h-[140px]">
            <h4 className="font-semibold text-md text-black mb-3">
              Are there any setup fees?
            </h4>
            <p className="text-gray-600 text-sm">
              No, there are no setup fees or hidden charges. You only pay for the subscription plan you choose.
            </p>
          </div>

         
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-300 min-h-[140px]">
            <h4 className="font-semibold text-md text-black mb-3">
              How do I cancel my subscription?
            </h4>
            <p className="text-gray-600 text-sm">
              You can cancel your subscription anytime from your account settings. Your access continues until the end of your billing period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AskedQuestions;
