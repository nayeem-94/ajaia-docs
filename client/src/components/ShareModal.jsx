
import { useEffect, useState } from "react";
import { X, Users, Trash2, Mail } from "lucide-react";
import api from "../services/api";

export default function ShareModal({ documentId, onClose }) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchShares = async () => {
    try {
      const response = await api.get(`/shares/${documentId}`);
      setShares(response.data.shares);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load sharing details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, [documentId]);

  const handleShare = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post(`/shares/${documentId}`, {
        email,
        permission
      });

      setEmail("");
      setMessage("Document shared successfully.");
      fetchShares();
    } catch (err) {
      setError(err.response?.data?.message || "Could not share document");
    }
  };

  const handleRemove = async (shareId) => {
    if (!window.confirm("Remove this person's access?")) return;

    try {
      await api.delete(`/shares/${documentId}/${shareId}`);
      setShares((previous) =>
        previous.filter((share) => share.id !== shareId)
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove access");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Share document
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Invite people to access this document.
            </p>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {error && (
          <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </p>
        )}

        {message && (
          <p className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {message}
          </p>
        )}

        <form onSubmit={handleShare} className="space-y-3">
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3 text-slate-400" />

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter registered user's email"
              className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-3"
            >
              <option value="view">Viewer</option>
              <option value="edit">Editor</option>
            </select>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg font-medium"
            >
              Share
            </button>
          </div>
        </form>

        <div className="border-t mt-6 pt-5">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Users size={18} />
            People with access
          </h3>

          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : shares.length === 0 ? (
            <p className="text-sm text-slate-500">
              This document hasn't been shared yet.
            </p>
          ) : (
            <div className="space-y-3">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">
                      {share.user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {share.user.email}
                    </p>
                    <span className="text-xs text-blue-600 capitalize">
                      {share.permission}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemove(share.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Remove access"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
