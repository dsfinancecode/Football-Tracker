import { supabase } from "@/lib/supabase";

// Force Next.js to fetch fresh data every time the page loads
export const dynamic = "force-dynamic";

export default async function KittyPage() {
  // Fetch all transactions excluding "Player Game Fee" and join with players to get the name
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select(`
      *,
      players (
        name
      )
    `)
    .neq("type", "Player Game Fee")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching kitty transactions:", error);
  }

  const txList = transactions || [];
  
  // Calculate total kitty pool (Sum of all cash/bank payments minus kitty expenses)
  const totalBalance = txList.reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kitty</h1>
          <p className="text-gray-500 mt-1">Pool of all collected payments and expenses</p>
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
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Player</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {txList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No kitty transactions recorded yet.</td>
                </tr>
              ) : (
                txList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                      {tx.date ? new Date(tx.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {tx.type || "Transaction"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {/* Supabase returns joined relational data in a nested object */}
                      {(tx as any).players?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tx.description || "-"}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${tx.amount > 0 ? "text-green-600" : tx.amount < 0 ? "text-red-600" : "text-gray-500"}`}>
                      {tx.amount > 0 ? "+" : tx.amount < 0 ? "-" : ""}£{Math.abs(Number(tx.amount)).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}