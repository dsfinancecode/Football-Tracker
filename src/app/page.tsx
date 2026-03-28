import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Force Next.js to fetch fresh data every time the page loads
export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch players and their associated transactions in a single query
  const { data: playersData, error } = await supabase
    .from("players")
    .select(`
      id,
      name,
      transactions (
        amount
      )
    `)
    .order("name");

  if (error) {
    console.error("Error fetching players:", error);
  }

  // Calculate the total balance for each player
  const players = playersData?.map((player) => {
    const totalBalance = player.transactions.reduce(
      (sum, tx) => sum + Number(tx.amount),
      0
    );

    return {
      id: player.id,
      name: player.name,
      balance: totalBalance,
    };
  }) || [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Player Balances</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Player Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Current Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                    No players found. Add some in the Admin dashboard!
                  </td>
                </tr>
              ) : (
                players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {/* Ready for Page 2! */}
                      <Link href={`/player/${player.id}`} className="hover:text-blue-600 transition-colors">
                        {player.name}
                      </Link>
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${player.balance > 0 ? "text-green-600" : player.balance < 0 ? "text-red-600" : "text-gray-500"}`}>
                      {player.balance > 0 ? "+" : ""}{player.balance.toFixed(2)}
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