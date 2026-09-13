// PAGE: Main Admin Dashboard (/admin)

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { logout } from "@/actions";
import { createBrowserClient } from "@supabase/ssr";

// Define TypeScript interfaces for our data
interface Player {
  id: string;
  name: string;
}

export default function AdminPage() {
  // Memoize the SSR browser client so it doesn't lose the auth session on re-renders
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // State for fetching players (used in the transaction dropdown)
  const [players, setPlayers] = useState<Player[]>([]);
  
  // State for Add Player form
  const [newPlayerName, setNewPlayerName] = useState("");
  const [playerStatus, setPlayerStatus] = useState("");

  // State for Add Transaction form
  const [txPlayerId, setTxPlayerId] = useState("");
  const [txToPlayerId, setTxToPlayerId] = useState("");
  const [txAmount, setTxAmount] = useState("4");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]); // Default to today: YYYY-MM-DD
  const [txType, setTxType] = useState("Game Fee");
  const [txDescription, setTxDescription] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // State for Bank Details
  const [bankStatus, setBankStatus] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankSortCode, setBankSortCode] = useState("");

  // State for App Settings
  const [showKitty, setShowKitty] = useState(true);

  // Fetch players from Supabase when the page loads
  useEffect(() => {
    fetchPlayers();
    fetchSettings();
  }, []);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("id, name")
      .order("name");
    
    if (data) setPlayers(data);
    if (error) console.error("Error fetching players:", error);
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["bank_details", "kitty_settings"]);
    
    if (data) {
      const bankDetails = data.find((row) => row.key === "bank_details")?.value;
      if (bankDetails) {
        setBankAccountName(bankDetails.accountName || "");
        setBankAccountNumber(bankDetails.accountNumber || "");
        setBankSortCode(bankDetails.sortCode || "");
      }

      const kittySettings = data.find((row) => row.key === "kitty_settings")?.value;
      if (kittySettings && typeof kittySettings.show !== 'undefined') {
        setShowKitty(kittySettings.show);
      }
    }
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

    const finalAmountParsed = parseFloat(txAmount);
    let insertData = [];

    if (txType === "Transfer") {
      if (!txPlayerId || !txToPlayerId) {
        setTxStatus("Please select both a sender and a receiver.");
        return;
      }
      if (txPlayerId === txToPlayerId) {
        setTxStatus("Sender and receiver must be different.");
        return;
      }
      
      const transferAmount = Math.abs(finalAmountParsed);
      const senderName = players.find(p => p.id === txPlayerId)?.name || "Unknown";
      const receiverName = players.find(p => p.id === txToPlayerId)?.name || "Unknown";
      
      insertData = [
        { player_id: txPlayerId, amount: -transferAmount, date: txDate, type: txType, description: txDescription || `Transfer to ${receiverName}` },
        { player_id: txToPlayerId, amount: transferAmount, date: txDate, type: txType, description: txDescription || `Transfer from ${senderName}` }
      ];
    } else {
      // Automatically handle positive/negative amounts based on type
      let finalAmount = finalAmountParsed;
      if (txType === "Game Fee" || txType === "Pitch Booking" || txType === "Kitty Expense") {
        finalAmount = -Math.abs(finalAmount); // Save as negative deduction
      } else if (txType !== "Misc") {
        finalAmount = Math.abs(finalAmount); // Save as positive payment
      }

      insertData = [{
        player_id: txPlayerId || null, amount: finalAmount, date: txDate, type: txType, description: txDescription
      }];
    }

    const { error } = await supabase.from("transactions").insert(insertData);

    if (error) {
      setTxStatus("Error adding transaction.");
      console.error(error);
    } else {
      setTxStatus("Transaction saved successfully!");
      
      if (txType === "Game Fee") setTxAmount("4");
      else if (txType.endsWith("Payment")) setTxAmount("4");
      else setTxAmount(""); // Reset amount for expenses, but keep date and type!
      setTxDescription("");
      setTxToPlayerId("");
      
      setTimeout(() => setTxStatus(""), 3000);
    }
  };

  // Handler to update bank details
  const handleUpdateBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankStatus("Saving...");
    
    const { error } = await supabase
      .from("settings")
      .upsert({ 
        key: "bank_details", 
        value: { accountName: bankAccountName, accountNumber: bankAccountNumber, sortCode: bankSortCode } 
      });

    if (error) {
      setBankStatus("Error saving details.");
      console.error(error);
    } else {
      setBankStatus("Bank details updated successfully!");
      setTimeout(() => setBankStatus(""), 3000);
    }
  };

  // Handler to toggle kitty balance visibility
  const handleToggleKitty = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setShowKitty(newValue);
    
    await supabase
      .from("settings")
      .upsert({ 
        key: "kitty_settings", 
        value: { show: newValue } 
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
        <div className="flex items-center gap-3">
          <Link href="/kitty" className="px-5 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors shadow-sm">
            Kitty Balance
          </Link>
          <form action={logout}>
            <button type="submit" title="Log out" className="px-3 py-2 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H9" />
              </svg>
            </button>
          </form>
        </div>
      </div>

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
            <Link href="/admin/players" className="flex-1 sm:flex-none px-6 py-2 bg-white border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center">
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
                <option value="Transfer">Transfer</option>
                <option value="Misc">Misc</option>
              </select>
            </div>
            
            {txType === "Transfer" ? (
              <>
                <div className="hidden md:block"></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Player</label>
                  <select required value={txPlayerId} onChange={(e) => setTxPlayerId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors">
                    <option value="" disabled>Select sender...</option>
                    {players.map((player) => (<option key={player.id} value={player.id}>{player.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Player</label>
                  <select required value={txToPlayerId} onChange={(e) => setTxToPlayerId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors">
                    <option value="" disabled>Select receiver...</option>
                    {players.map((player) => (<option key={player.id} value={player.id}>{player.name}</option>))}
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className={`block text-sm font-medium mb-1 ${txType === "Kitty Expense" || txType === "Pitch Booking" ? "text-gray-400" : "text-gray-700"}`}>
                  Player {txType === "Misc" && <span className="text-gray-400 font-normal">(Optional)</span>}
                </label>
                <select disabled={txType === "Kitty Expense" || txType === "Pitch Booking"} required={!(txType === "Kitty Expense" || txType === "Pitch Booking" || txType === "Misc")} value={txPlayerId} onChange={(e) => setTxPlayerId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                  <option value="" disabled={!(txType === "Kitty Expense" || txType === "Pitch Booking" || txType === "Misc")}>Select a player...</option>
                  {players.map((player) => (<option key={player.id} value={player.id}>{player.name}</option>))}
                </select>
              </div>
            )}

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
              <Link href="/admin/transactions" className="px-6 py-2 bg-white border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center">
                Manage
              </Link>
            </div>
          </div>
        </form>
      </section>

      {/* Update Bank Details Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Bank Details</h2>
        <form onSubmit={handleUpdateBankDetails} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input type="text" required value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} placeholder="e.g. John Doe" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input type="text" required value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="8 digit number" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code</label>
              <input type="text" required value={bankSortCode} onChange={(e) => setBankSortCode(e.target.value)} placeholder="xx-xx-xx" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <p className="text-sm text-green-600 font-medium">{bankStatus}</p>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              Update Details
            </button>
          </div>
        </form>
      </section>

      {/* App Settings Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">App Settings</h2>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={showKitty} 
            onChange={handleToggleKitty}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-colors cursor-pointer"
          />
          <span className="text-gray-700 font-medium">Show Kitty Balance button on public page</span>
        </label>
      </section>
    </div>
  );
}