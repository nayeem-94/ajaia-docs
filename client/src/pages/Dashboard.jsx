
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, FileText, Loader2 } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import DocumentCard from "../components/DocumentCard";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/documents");
      setDocuments(response.data.documents);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const createDocument = async () => {
    try {
      const response = await api.post("/documents");
      navigate(`/editor/${response.data.document.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Could not create document");
    }
  };

  const renameDocument = async (document) => {
    const newTitle = prompt("Enter new document name:", document.title);

    if (!newTitle?.trim()) return;

    try {
      await api.put(`/documents/${document.id}`, {
        title: newTitle.trim()
      });

      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || "Rename failed");
    }
  };

  const deleteDocument = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/documents/${id}`);
      setDocuments((previous) =>
        previous.filter((document) => document.id !== id)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const filteredDocuments = documents.filter((document) =>
    document.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">
            Ajaia Docs
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user?.name}
            </span>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg text-sm text-red-600 bg-red-50 hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              My Documents
            </h2>

            <p className="text-slate-500 mt-2">
              Create and manage your documents in one place.
            </p>
          </div>

          <button
            onClick={createDocument}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium"
          >
            <Plus size={19} />
            New Document
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search
            className="absolute left-3 top-3 text-slate-400"
            size={19}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </p>
        )}

        {/* Document List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={30} />
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={{
                  ...document,
                  isOwner: document.ownerId === user?.id
                }}
                onOpen={(id) => navigate(`/editor/${id}`)}
                onRename={renameDocument}
                onDelete={deleteDocument}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-20 text-center">
            <FileText size={45} className="mx-auto text-slate-300" />

            <h3 className="text-xl font-semibold text-slate-800 mt-4">
              {search ? "No documents found" : "No documents yet"}
            </h3>

            <p className="text-slate-500 mt-2">
              {search
                ? "Try another search term."
                : "Create your first document to get started."}
            </p>

            {!search && (
              <button
                onClick={createDocument}
                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg"
              >
                Create Document
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
