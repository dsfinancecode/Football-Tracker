"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Transaction {
  id: string;
  date: string;
  type: string;
  player_id: string | null;
  description: string | null;
  amount: number;
  players?: { name: string } | null;
}

const getTypeColor = (type: string | null) => {
  switch (type) {
    case "Game Fee": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Bank Payment": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Cash Payment": return "bg-teal-100 text-teal-800 border-teal-200";
    case "Kitty Expense": return "bg-red-100 text-red-800 border-red-200";
    case "Pitch Booking": return "bg-purple-100 text-purple-800 border-purple-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function KittyPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPlayer, setFilterPlayer] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        players (
          name
        )
      `)
      .neq("type", "Game Fee")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (data) setTransactions(data);
    if (error) console.error("Error fetching kitty transactions:", error);
  };

  // Extract unique lists for our dropdown menus
  const uniqueTypes = Array.from(new Set(transactions.map(tx => tx.type).filter(Boolean)));
  const uniquePlayers = Array.from(new Set(transactions.map(tx => tx.players?.name).filter(Boolean)));

  // Apply active filters dynamically
  const filteredTxList = useMemo(() => {
    return transactions.filter(tx => {
      const matchDate = filterDate ? tx.date === filterDate : true;
      const matchType = filterType ? tx.type === filterType : true;
      const matchPlayer = filterPlayer ? tx.players?.name === filterPlayer : true;
      return matchDate && matchType && matchPlayer;
    });
  }, [transactions, filterDate, filterType, filterPlayer]);

  // Automatically jump back to page 1 if the user changes a filter
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate, filterType, filterPlayer]);

  // Calculate dynamic KPIs based on the filtered list
  const totalBalance = filteredTxList.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const txCount = filteredTxList.length;

  // Paginate the transactions
  const totalPages = Math.ceil(filteredTxList.length / ITEMS_PER_PAGE);
  const paginatedTxList = filteredTxList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kitty</h1>
          <p className="text-gray-500 mt-1">Pool of all collected payments and expenses</p>
          <div className="mt-3">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors group">
              <span className="transform group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
              Back to Admin
            </Link>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-end justify-center">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Count</span>
            <span className="text-xl font-bold text-gray-900">{txCount}</span>
          </div>
          <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-end justify-center">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Balance</span>
            <span className={`text-xl font-bold ${totalBalance > 0 ? "text-green-600" : totalBalance < 0 ? "text-red-600" : "text-gray-900"}`}>
              {totalBalance > 0 ? "+" : totalBalance < 0 ? "-" : ""}£{Math.abs(totalBalance).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date</label>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-700">
            <option value="">All Types</option>
            {uniqueTypes.map(type => <option key={type} value={type as string}>{type as string}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Player</label>
          <select value={filterPlayer} onChange={(e) => setFilterPlayer(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-gray-700">
            <option value="">All Players</option>
            {uniquePlayers.map(player => <option key={player} value={player as string}>{player as string}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={() => { setFilterDate(""); setFilterType(""); setFilterPlayer(""); }} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full md:w-auto">
            Clear
          </button>
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
              {paginatedTxList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No kitty transactions recorded yet.</td>
                </tr>
              ) : (
                paginatedTxList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                      {tx.date ? new Date(tx.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(tx.type)}`}>
                        {tx.type || "Transaction"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {tx.players?.name || "-"}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage <= 1} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${currentPage <= 1 ? "opacity-50 text-gray-400 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white border-gray-200 hover:bg-gray-100"}`}>
                Previous
              </button>
              <span className="text-sm font-medium text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage >= totalPages} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${currentPage >= totalPages ? "opacity-50 text-gray-400 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white border-gray-200 hover:bg-gray-100"}`}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}