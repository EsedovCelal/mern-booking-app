import { Link } from "react-router-dom";
import { AiOutlineCloseCircle, AiOutlineArrowLeft } from "react-icons/ai";

const CancelPayment = () => {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="bg-white border border-slate-300 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-50 p-8 border-b border-red-100 flex flex-col items-center text-center">
          <AiOutlineCloseCircle className="text-red-500 text-7xl mb-4" />
          <h1 className="text-3xl font-bold text-slate-800">
            Payment Canceled
          </h1>
          <p className="text-slate-600 mt-2 max-w-md">
            Your transaction was not completed. No charges were made to your
            account.
          </p>
        </div>

        <div className="p-8 flex flex-col items-center">
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-8 w-full">
            <h3 className="text-slate-700 font-semibold mb-2 text-center">
              What happened?
            </h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex gap-2">
                <span className="text-red-500">•</span>
                The payment process was closed before completion.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">•</span>
                You may have chosen to cancel on the payment provider page.
              </li>
              <li className="flex gap-2">
                <span className="text-red-500">•</span>
                There might have been a temporary connection issue.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-700 transition shadow-sm"
            >
              Return to Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 border border-slate-300 bg-white text-slate-700 px-6 py-3 rounded-md font-bold hover:bg-slate-50 transition"
            >
              <AiOutlineArrowLeft /> Try Again
            </button>
          </div>

          <p className="mt-8 text-sm text-slate-400">
            Need help?{" "}
            <Link to="/contact" className="text-blue-600 hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancelPayment;
