"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Player {
  id: string;
  name: string;
}

export default function ManagePlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("name");
    
    if (data) setPlayers(data);
    if (error) console.error("Error fetching players:", error);
  };

  const handleEditClick = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setStatusMessage(null);
  };

  const handleSave = async (id: string) => {
    if (!editName.trim()) return;

    const { error } = await supabase
      .from("players")
      .update({ name: editName.trim() })
      .eq("id", id);

    if (error) {
      setStatusMessage({ type: "error", text: "Failed to update player name." });
    } else {
      setStatusMessage({ type: "success", text: "Player updated successfully!" });
      setEditingId(null);
      fetchPlayers();
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", id);

    if (error) {
      // Usually fails if the player has existing transactions due to foreign key constraints
      setStatusMessage({ 
        type: "error", 
        text: "Cannot delete this player. They have existing transactions." 
      });
    } else {
      setStatusMessage({ type: "success", text: "Player deleted successfully!" });
      fetchPlayers();
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Players</h1>
          <p className="text-gray-500 mt-1">Edit names or remove players</p>
          <div className="mt-3">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors group">
              <span className="transform group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
              Back to Admin
            </Link>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-lg text-sm font-medium ${statusMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {statusMessage.text}
        </div>
      )}

      {/* Players Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Player Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-gray-500">No players found.</td>
                </tr>
              ) : (
                players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {editingId === player.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        player.name
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-3">
                      {editingId === player.id ? (
                        <button onClick={() => handleSave(player.id)} className="text-green-600 hover:text-green-800 p-1 transition-colors" title="Save">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                      ) : (
                        <button onClick={() => handleEditClick(player)} className="text-gray-400 hover:text-blue-600 p-1 transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                      )}
                      <button onClick={() => handleDelete(player.id, player.name)} className="text-gray-400 hover:text-red-600 p-1 transition-colors" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
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