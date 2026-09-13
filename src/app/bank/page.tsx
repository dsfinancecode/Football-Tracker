// PAGE: Public Bank Details (/bank)

import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function BankDetailsPage() {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "bank_details")
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching bank details:", error);
  }

  const bankDetails = data?.value || {};

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 pt-1">Bank Details</h1>
          <div className="mt-3">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors group">
              <span className="transform group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account Name</h2>
          <p className="mt-1 text-xl font-medium text-gray-900">{bankDetails.accountName || "Not set"}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Sort Code</h2>
            <p className="mt-1 text-xl font-medium text-gray-900">{bankDetails.sortCode || "Not set"}</p>
          </div>
          
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account Number</h2>
            <p className="mt-1 text-xl font-medium text-gray-900">{bankDetails.accountNumber || "Not set"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}