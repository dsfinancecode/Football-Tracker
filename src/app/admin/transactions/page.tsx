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

export default function ManageTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    
    if (data) setTransactions(data);
    if (error) console.error("Error fetching transactions:", error);
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingId(tx.id);
    // For editing, we use the raw database value including negatives
    setEditAmount(tx.amount.toString());
    setEditDescription(tx.description || "");
    setEditDate(tx.date || "");
    setStatusMessage(null);
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from("transactions")
      .update({ 
        amount: parseFloat(editAmount),
        description: editDescription,
        date: editDate
      })
      .eq("id", id);

    if (error) {
      setStatusMessage({ type: "error", text: "Failed to update transaction." });
    } else {
      setStatusMessage({ type: "success", text: "Transaction updated successfully!" });
      setEditingId(null);
      fetchTransactions();
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      setStatusMessage({ type: "error", text: "Failed to delete transaction." });
    } else {
      setStatusMessage({ type: "success", text: "Transaction deleted successfully!" });
      fetchTransactions();
      setTimeout(() => setStatusMessage(null), 3000);
    }
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

  // Pagination logic
  const totalPages = Math.ceil(filteredTxList.length / ITEMS_PER_PAGE);
  const paginatedTxList = filteredTxList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Transactions</h1>
          <p className="text-gray-500 mt-1">Edit details or remove transactions</p>
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

      {statusMessage && (
        <div className={`p-4 rounded-lg text-sm font-medium ${statusMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {statusMessage.text}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedTxList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No transactions found.</td>
                </tr>
              ) : (
                paginatedTxList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap align-top pt-5">
                      {editingId === tx.id ? (
                        <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      ) : (
                        tx.date ? new Date(tx.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(tx.type)}`}>
                            {tx.type || "Transaction"}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {(tx as any).players?.name || ""}
                          </span>
                        </div>
                        {editingId === tx.id ? (
                          <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mt-1" />
                        ) : (
                          tx.description && <span className="text-xs text-gray-500">{tx.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-top pt-5">
                      {editingId === tx.id ? (
                        <input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      ) : (
                        <span className={`font-semibold ${tx.amount > 0 ? "text-green-600" : tx.amount < 0 ? "text-red-600" : "text-gray-500"}`}>
                          {tx.amount > 0 ? "+" : tx.amount < 0 ? "-" : ""}£{Math.abs(Number(tx.amount)).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-3 align-top pt-5">
                      {editingId === tx.id ? (
                        <button onClick={() => handleSave(tx.id)} className="text-green-600 hover:text-green-800 p-1 transition-colors" title="Save"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                      ) : (
                        <button onClick={() => handleEditClick(tx)} className="text-gray-400 hover:text-blue-600 p-1 transition-colors" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                      )}
                      <button onClick={() => handleDelete(tx.id)} className="text-gray-400 hover:text-red-600 p-1 transition-colors" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage <= 1} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${currentPage <= 1 ? "opacity-50 text-gray-400 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white border-gray-200 hover:bg-gray-100"}`}>Previous</button>
              <span className="text-sm font-medium text-gray-500">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage >= totalPages} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${currentPage >= totalPages ? "opacity-50 text-gray-400 border-gray-200 cursor-not-allowed" : "text-gray-700 bg-white border-gray-200 hover:bg-gray-100"}`}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}