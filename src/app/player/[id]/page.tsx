import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force Next.js to fetch fresh data every time the page loads
export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // In modern Next.js, dynamic route params are awaited
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const playerId = resolvedParams.id;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const ITEMS_PER_PAGE = 15;

  // 1. Fetch the specific player's details
  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .single();

  if (playerError || !player) {
    notFound(); // Triggers the Next.js 404 page if player ID doesn't exist
  }

  // 2. Fetch all transactions for this player, sorted by newest first
  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .eq("player_id", playerId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (txError) {
    console.error("Error fetching transactions:", txError);
  }

  const txList = transactions || [];
  
  // 3. Calculate the total balance again
  const totalBalance = txList.reduce((sum, tx) => sum + Number(tx.amount), 0);

  // 4. Paginate the transactions
  const totalPages = Math.ceil(txList.length / ITEMS_PER_PAGE);
  const paginatedTxList = txList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{player.name}</h1>
          <p className="text-gray-500 mt-1">Transaction History</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Balance:</span>
          <span className={`text-2xl font-bold ${totalBalance > 0 ? "text-green-600" : totalBalance < 0 ? "text-red-600" : "text-gray-900"}`}>
            {totalBalance > 0 ? "+" : totalBalance < 0 ? "-" : ""}£{Math.abs(totalBalance).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedTxList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No transactions recorded yet.</td>
                </tr>
              ) : (
                paginatedTxList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {tx.date ? new Date(tx.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {tx.type || "Transaction"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tx.description || "-"}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${tx.amount > 0 ? "text-green-600" : tx.amount < 0 ? "text-red-600" : "text-gray-500"}`}>
                      {tx.amount > 0 ? "+" : tx.amount < 0 ? "-" : ""}£{Math.abs(Number(tx.amount)).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
              <Link
                href={`/player/${playerId}?page=${currentPage - 1}`}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  currentPage <= 1
                    ? "pointer-events-none opacity-50 text-gray-400 border-gray-200"
                    : "text-gray-700 bg-white border-gray-200 hover:bg-gray-100"
                }`}
              >
                Previous
              </Link>
              <span className="text-sm font-medium text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={`/player/${playerId}?page=${currentPage + 1}`}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50 text-gray-400 border-gray-200"
                    : "text-gray-700 bg-white border-gray-200 hover:bg-gray-100"
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}