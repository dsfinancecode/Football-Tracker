"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Define TypeScript interfaces for our data
interface Player {
  id: string;
  name: string;
}

export default function AdminPage() {
  // State for fetching players (used in the transaction dropdown)
  const [players, setPlayers] = useState<Player[]>([]);
  
  // State for Add Player form
  const [newPlayerName, setNewPlayerName] = useState("");
  const [playerStatus, setPlayerStatus] = useState("");

  // State for Add Transaction form
  const [txPlayerId, setTxPlayerId] = useState("");
  const [txAmount, setTxAmount] = useState("4");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]); // Default to today: YYYY-MM-DD
  const [txType, setTxType] = useState("Game Fee");
  const [txDescription, setTxDescription] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // Fetch players from Supabase when the page loads
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("id, name")
      .order("name");
    
    if (data) setPlayers(data);
    if (error) console.error("Error fetching players:", error);
  };

  // Handler to submit a new player
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlayerStatus("Adding...");
    
    const { error } = await supabase
      .from("players")
      .insert([{ name: newPlayerName }]);

    if (error) {
      setPlayerStatus("Error adding player.");
      console.error(error);
    } else {
      setPlayerStatus("Player added successfully!");
      setNewPlayerName("");
      fetchPlayers(); // Refresh the dropdown list immediately
      setTimeout(() => setPlayerStatus(""), 3000); // Clear message after 3s
    }
  };

  // Handler to submit a new transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxStatus("Adding...");

    // Automatically handle positive/negative amounts based on type
    let finalAmount = parseFloat(txAmount);
    if (txType === "Game Fee" || txType === "Pitch Booking" || txType === "Kitty Expense") {
      finalAmount = -Math.abs(finalAmount); // Save as negative deduction
    } else {
      finalAmount = Math.abs(finalAmount); // Save as positive payment
    }

    const { error } = await supabase
      .from("transactions")
      .insert([{
        // Supabase requires null instead of an empty string if no player is selected
        player_id: txPlayerId || null, 
        amount: finalAmount,
        date: txDate,
        type: txType,
        description: txDescription
      }]);

    if (error) {
      setTxStatus("Error adding transaction.");
      console.error(error);
    } else {
      setTxStatus("Transaction saved successfully!");
      
      if (txType === "Game Fee") setTxAmount("4");
      else if (txType.endsWith("Payment")) setTxAmount("4");
      else setTxAmount(""); // Reset amount for expenses, but keep date and type!
      setTxDescription("");
      
      setTimeout(() => setTxStatus(""), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">

      {/* Add Player Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Player</h2>
        <form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <input
              type="text"
              required
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Enter player's full name"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            {playerStatus && <p className="mt-2 text-sm text-green-600 font-medium">{playerStatus}</p>}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button type="submit" className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              Add Player
            </button>
            <Link href="/admin/players" className="flex-1 sm:flex-none px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm flex items-center justify-center">
              Manage
            </Link>
          </div>
        </form>
      </section>

      {/* Add Transaction Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Transaction</h2>
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select required value={txType} onChange={(e) => {
                const newType = e.target.value;
                setTxType(newType);
                if (newType === "Kitty Expense" || newType === "Pitch Booking") setTxPlayerId("");
                if (newType === "Game Fee") setTxAmount("4");
                else if (newType.endsWith("Payment")) setTxAmount("4");
                else setTxAmount("");
              }} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="Game Fee">Game Fee</option>
                <option value="Bank Payment">Bank Payment</option>
                <option value="Cash Payment">Cash Payment</option>
                <option value="Kitty Expense">Kitty Expense</option>
                <option value="Pitch Booking">Pitch Booking</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${txType === "Kitty Expense" || txType === "Pitch Booking" ? "text-gray-400" : "text-gray-700"}`}>
                Player
              </label>
              <select disabled={txType === "Kitty Expense" || txType === "Pitch Booking"} required={!(txType === "Kitty Expense" || txType === "Pitch Booking")} value={txPlayerId} onChange={(e) => setTxPlayerId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                <option value="" disabled={!(txType === "Kitty Expense" || txType === "Pitch Booking")}>Select a player...</option>
                {players.map((player) => (<option key={player.id} value={player.id}>{player.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input type="number" step="0.01" required value={txAmount} onChange={(e) => setTxAmount(e.target.value)} placeholder="e.g., 5.00 or 10.00" className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold ${txType === "Game Fee" || txType === "Pitch Booking" || txType === "Kitty Expense" ? "text-red-600" : "text-green-600"}`} />
              <p className="text-xs text-gray-500 mt-1">Fees and expenses are automatically saved as deductions.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" required value={txDate} onChange={(e) => setTxDate(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={txDescription} onChange={(e) => setTxDescription(e.target.value)} placeholder="e.g., Weekly match fee, Transfer from John" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="pt-2 flex items-center justify-between">
            <p className="text-sm text-green-600 font-medium">{txStatus}</p>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                Save Transaction
              </button>
              <Link href="/kitty" className="px-6 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-sm flex items-center justify-center">
                Kitty
              </Link>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}