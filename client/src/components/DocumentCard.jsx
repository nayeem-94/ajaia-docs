
import { FileText, Trash2, Pencil, Clock } from "lucide-react";

export default function DocumentCard({
  document,
  onOpen,
  onRename,
  onDelete
}) {
  const updatedDate = new Date(document.updatedAt).toLocaleDateString();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition">
      <div
        onClick={() => onOpen(document.id)}
        className="cursor-pointer"
      >
        <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
          <FileText className="text-blue-600" size={22} />
        </div>

        <h3 className="font-semibold text-slate-800 truncate">
          {document.title}
        </h3>

        <p className="text-xs text-slate-500 mt-2">
          Owner: {document.owner?.name || "You"}
        </p>

        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <Clock size={13} />
          Updated {updatedDate}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t">
        <button
          onClick={() => onRename(document)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          title="Rename"
        >
          <Pencil size={17} />
        </button>

        {document.isOwner !== false && (
          <button
            onClick={() => onDelete(document.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
            title="Delete"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>
    </div>
  );
}
