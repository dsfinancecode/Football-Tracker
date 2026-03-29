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

  // Sort players: Negatives first, then Positives, then Zeros
  players.sort((a, b) => {
    const groupA = a.balance < 0 ? 1 : a.balance > 0 ? 2 : 3;
    const groupB = b.balance < 0 ? 1 : b.balance > 0 ? 2 : 3;

    // 1. Sort by group
    if (groupA !== groupB) return groupA - groupB;

    // 2. Within negatives, lowest number (-10) comes before (-4)
    if (groupA === 1) return a.balance - b.balance;
    // 3. Within positives, highest credit (10) comes before (4)
    if (groupA === 2) return b.balance - a.balance;
    // 4. For zero balances, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 pt-1">Player Balances</h1>
        <p className="text-gray-500 mt-1">Click player name to view transaction history</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Player Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Current Balance</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No players found. Add some in the Admin dashboard!
                  </td>
                </tr>
              ) : (
                players.map((player) => (
                  <tr key={player.id} className="hover:bg-blue-50 transition-colors group">
                    <td className="font-medium text-gray-900 p-0">
                      <Link href={`/player/${player.id}`} className="px-6 py-4 block w-full h-full">
                        {player.name}
                      </Link>
                    </td>
                    <td className={`text-right font-semibold p-0 ${player.balance > 0 ? "text-green-600" : player.balance < 0 ? "text-red-600" : "text-gray-500"}`}>
                      <Link href={`/player/${player.id}`} className="px-6 py-4 block w-full h-full">
                        {player.balance > 0 ? "+" : player.balance < 0 ? "-" : ""}£{Math.abs(player.balance).toFixed(2)}
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link href={`/player/${player.id}`} className="px-6 py-4 flex items-center justify-end w-full h-full text-gray-400 group-hover:text-blue-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </Link>
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