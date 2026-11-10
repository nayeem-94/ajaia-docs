
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

import {
    ArrowLeft,
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Loader2,
    Check,
    Upload,
    Share2
} from "lucide-react";

import ShareModal from "../components/ShareModal";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";


export default function Editor() {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    // States
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showShareModal, setShowShareModal] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    // Autosave timer
    const timerRef = useRef(null);

    // Tiptap editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline
        ],

        content: "<p></p>",

        // Initially disable editing
        editable: false,

        editorProps: {
            attributes: {
                class: "outline-none min-h-[650px] text-slate-800 leading-8"
            }
        },

        // Auto save content
        onUpdate: ({ editor }) => {
            clearTimeout(timerRef.current);

            setSaving(true);
            setError("");

            timerRef.current = setTimeout(async () => {
                try {
                    await api.put(`/documents/${id}`, {
                        content: editor.getJSON()
                    });

                    setSaving(false);
                } catch (err) {
                    setSaving(false);
                    setError("Could not save your changes.");
                }
            }, 800);
        }
    });


    // =====================================
    // Load Document
    // =====================================

    useEffect(() => {
        let cancelled = false;

        const fetchDocument = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/documents/${id}`);

                // Backend returns the document directly
                const document = response.data;

                if (cancelled) return;

                // Check ownership
                const owner = document.ownerId === user?.id;
                setIsOwner(owner);

                // Check permission
                const permission = document.currentUserPermission;

                const allowed =
                    permission === "owner" ||
                    permission === "edit";

                setCanEdit(allowed);

                // Enable or disable editor
                editor.setEditable(allowed);

                // Load title
                setTitle(document.title);

                // Load document content
                editor.commands.setContent(
                    document.content || {
                        type: "doc",
                        content: [{ type: "paragraph" }]
                    },
                    { emitUpdate: false }
                );

                setSaving(false);

            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Could not load document."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (editor) {
            fetchDocument();
        }

        return () => {
            cancelled = true;
            clearTimeout(timerRef.current);
        };

    }, [id, editor, user?.id]);


    // =====================================
    // Save Document Title
    // =====================================

    const saveTitle = async () => {

        // Viewer cannot change title
        if (!canEdit) return;

        const newTitle = title.trim() || "Untitled document";

        try {
            setSaving(true);
            setError("");

            await api.put(`/documents/${id}`, {
                title: newTitle
            });

            setTitle(newTitle);
            setSaving(false);

        } catch (err) {
            setSaving(false);
            setError("Could not save document title.");
        }
    };


    // =====================================
    // Import TXT File
    // =====================================

    const importTextFile = async (event) => {

        // Only Owner and Editor can import
        if (!canEdit) {
            event.target.value = "";
            return;
        }

        const file = event.target.files?.[0];

        if (!file) return;

        // Validate file type
        if (!file.name.toLowerCase().endsWith(".txt")) {
            setError("Please select a .txt file.");
            event.target.value = "";
            return;
        }

        try {
            clearTimeout(timerRef.current);

            setSaving(true);
            setError("");

            const text = await file.text();

            // Convert TXT lines into paragraphs
            const paragraphs = text.split(/\r?\n/).map((line) => ({
                type: "paragraph",
                content: line
                    ? [{ type: "text", text: line }]
                    : []
            }));

            const content = {
                type: "doc",
                content: paragraphs.length
                    ? paragraphs
                    : [{ type: "paragraph" }]
            };

            // Update editor without triggering duplicate autosave
            editor.commands.setContent(content, {
                emitUpdate: false
            });

            // Save imported content
            await api.put(`/documents/${id}`, {
                content
            });

            setSaving(false);

        } catch (err) {
            setSaving(false);
            setError("Could not import this file.");
        } finally {
            event.target.value = "";
        }
    };


    // =====================================
    // Cleanup
    // =====================================

    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current);
        };
    }, []);


    // =====================================
    // Loading Screen
    // =====================================

    if (loading || !editor) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2
                    className="animate-spin text-blue-600"
                    size={30}
                />
            </div>
        );
    }


    // =====================================
    // Toolbar Button Component
    // =====================================

    const ToolButton = ({ onClick, active, children, label }) => (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={`p-2 rounded-lg transition ${
                active
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
            }`}
        >
            {children}
        </button>
    );


    // =====================================
    // Main UI
    // =====================================

    return (
        <div className="min-h-screen bg-slate-100">

            {/* Header */}
            <header className="bg-white border-b px-5 py-3">

                <div className="max-w-7xl mx-auto flex items-center gap-4">

                    {/* Back Button */}
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                        title="Back to dashboard"
                    >
                        <ArrowLeft size={21} />
                    </button>


                    {/* Document Title */}
                    <div className="flex-1 min-w-0">

                        <input
                            value={title}
                            readOnly={!canEdit}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={saveTitle}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.target.blur();
                                }
                            }}
                            className="font-semibold text-lg text-slate-800 outline-none w-full"
                            placeholder="Untitled document"
                        />

                        {/* Save Status */}
                        <p className="text-xs text-slate-400">

                            {saving ? (
                                "Saving..."
                            ) : (
                                <span className="flex items-center gap-1">
                                    <Check size={12} />
                                    All changes saved
                                </span>
                            )}

                        </p>

                    </div>


                    {/* Share Button: Owner Only */}
                    {isOwner && (
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            <Share2 size={17} />
                            Share
                        </button>
                    )}

                </div>
            </header>


            {/* Editor Toolbar: Owner and Editor Only */}
            {canEdit && (
                <div className="bg-white border-b sticky top-0 z-10">

                    <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-1 px-4 py-2">

                        {/* Bold */}
                        <ToolButton
                            label="Bold"
                            active={editor.isActive("bold")}
                            onClick={() =>
                                editor.chain().focus().toggleBold().run()
                            }
                        >
                            <Bold size={18} />
                        </ToolButton>


                        {/* Italic */}
                        <ToolButton
                            label="Italic"
                            active={editor.isActive("italic")}
                            onClick={() =>
                                editor.chain().focus().toggleItalic().run()
                            }
                        >
                            <Italic size={18} />
                        </ToolButton>


                        {/* Underline */}
                        <ToolButton
                            label="Underline"
                            active={editor.isActive("underline")}
                            onClick={() =>
                                editor.chain().focus().toggleUnderline().run()
                            }
                        >
                            <UnderlineIcon size={18} />
                        </ToolButton>


                        <div className="w-px h-6 bg-slate-200 mx-2" />


                        {/* Heading 1 */}
                        <ToolButton
                            label="Heading 1"
                            active={editor.isActive("heading", { level: 1 })}
                            onClick={() =>
                                editor.chain().focus()
                                    .toggleHeading({ level: 1 }).run()
                            }
                        >
                            <Heading1 size={19} />
                        </ToolButton>


                        {/* Heading 2 */}
                        <ToolButton
                            label="Heading 2"
                            active={editor.isActive("heading", { level: 2 })}
                            onClick={() =>
                                editor.chain().focus()
                                    .toggleHeading({ level: 2 }).run()
                            }
                        >
                            <Heading2 size={19} />
                        </ToolButton>


                        <div className="w-px h-6 bg-slate-200 mx-2" />


                        {/* Bullet List */}
                        <ToolButton
                            label="Bullet list"
                            active={editor.isActive("bulletList")}
                            onClick={() =>
                                editor.chain().focus().toggleBulletList().run()
                            }
                        >
                            <List size={19} />
                        </ToolButton>


                        {/* Numbered List */}
                        <ToolButton
                            label="Numbered list"
                            active={editor.isActive("orderedList")}
                            onClick={() =>
                                editor.chain().focus().toggleOrderedList().run()
                            }
                        >
                            <ListOrdered size={19} />
                        </ToolButton>


                        <div className="w-px h-6 bg-slate-200 mx-2" />


                        {/* Import TXT */}
                        <label className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">

                            <Upload size={17} />

                            Import TXT

                            <input
                                type="file"
                                accept=".txt,text/plain"
                                onChange={importTextFile}
                                className="hidden"
                            />

                        </label>

                    </div>
                </div>
            )}


            {/* Editor Area */}
            <main className="max-w-5xl mx-auto px-4 py-8">

                {/* Error Message */}
                {error && (
                    <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                        {error}
                    </p>
                )}


                {/* Document Content */}
                <div className="bg-white min-h-[800px] shadow-sm border border-slate-200 rounded-lg p-8 md:p-14">

                    <EditorContent editor={editor} />

                </div>

            </main>


            {/* Share Modal */}
            {showShareModal && (
                <ShareModal
                    documentId={id}
                    onClose={() => setShowShareModal(false)}
                />
            )}

        </div>
    );
}
