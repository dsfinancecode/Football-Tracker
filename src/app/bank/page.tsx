import Link from "next/link";

export default function BankDetailsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 pt-1">Bank Details</h1>
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors mt-2 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account Name</h2>
          <p className="mt-1 text-xl font-medium text-gray-900">Daniel Shand</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Sort Code</h2>
            <p className="mt-1 text-xl font-medium text-gray-900">60-83-71</p>
          </div>
          
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account Number</h2>
            <p className="mt-1 text-xl font-medium text-gray-900">77412193</p>
          </div>
        </div>
      </div>
    </div>
  );
}