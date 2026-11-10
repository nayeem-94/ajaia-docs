
import prisma from "../config/database.js";
import { validateDocumentUpdate } from "../utils/documentValidation.js";

// =====================================
// CREATE DOCUMENT
// =====================================

export const createDocument = async (req, res) => {
    try {
        const document = await prisma.document.create({
            data: {
                title: "Untitled document",

                content: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: []
                        }
                    ]
                },

                ownerId: req.user.id
            }
        });

        res.status(201).json({ document });

    } catch (error) {
        console.error("Create document error:", error);

        res.status(500).json({
            message: "Could not create document"
        });
    }
};


// =====================================
// GET ALL ACCESSIBLE DOCUMENTS
// =====================================

export const getDocuments = async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            where: {
                OR: [
                    { ownerId: req.user.id },

                    {
                        shares: {
                            some: {
                                userId: req.user.id
                            }
                        }
                    }
                ]
            },

            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },

                // Current user's sharing permission
                shares: {
                    where: {
                        userId: req.user.id
                    },
                    select: {
                        permission: true
                    }
                }
            },

            orderBy: {
                updatedAt: "desc"
            }
        });

        // Add current user's permission to every document
        const documentsWithPermission = documents.map((document) => {
            const permission =
                document.ownerId === req.user.id
                    ? "owner"
                    : document.shares[0]?.permission || "view";

            return {
                ...document,
                currentUserPermission: permission
            };
        });

        res.json({
            documents: documentsWithPermission
        });

    } catch (error) {
        console.error("Get documents error:", error);

        res.status(500).json({
            message: "Could not fetch documents"
        });
    }
};


// =====================================
// GET SINGLE DOCUMENT
// =====================================

export const getDocument = async (req, res) => {
    try {
        const document = await prisma.document.findFirst({
            where: {
                id: req.params.id,

                OR: [
                    { ownerId: req.user.id },

                    {
                        shares: {
                            some: {
                                userId: req.user.id
                            }
                        }
                    }
                ]
            },

            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },

                // Get only the current user's permission
                shares: {
                    where: {
                        userId: req.user.id
                    },

                    select: {
                        permission: true
                    }
                }
            }
        });

        if (!document) {
            return res.status(404).json({
                message: "Document not found or access denied"
            });
        }

        const permission =
            document.ownerId === req.user.id
                ? "owner"
                : document.shares[0]?.permission || "view";

        res.json({
            ...document,
            currentUserPermission: permission
        });

    } catch (error) {
        console.error("Get single document error:", error);

        res.status(500).json({
            message: "Could not fetch document"
        });
    }
};


// =====================================
// UPDATE DOCUMENT
// OWNER AND EDITOR ONLY
// =====================================


export const updateDocument = async (req, res) => {
    try {
        const { title, content } = req.body;

        // Check edit permission
        const document = await prisma.document.findFirst({
            where: {
                id: req.params.id,
                OR: [
                    { ownerId: req.user.id },
                    {
                        shares: {
                            some: {
                                userId: req.user.id,
                                permission: "edit"
                            }
                        }
                    }
                ]
            }
        });

        if (!document) {
            return res.status(404).json({
                message: "Document not found or you don't have edit access"
            });
        }

        // Validate request body
        const validationError = validateDocumentUpdate({
            title,
            content
        });

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        // Update document
        const updatedDocument = await prisma.document.update({
            where: {
                id: document.id
            },
            data: {
                ...(title !== undefined
                    ? {
                        title: title.trim() || "Untitled document"
                    }
                    : {}),
                ...(content !== undefined
                    ? { content }
                    : {})
            }
        });

        res.json({
            document: updatedDocument
        });

    } catch (error) {
        console.error("Update document error:", error);

        res.status(500).json({
            message: "Could not update document"
        });
    }
};


// =====================================
// DELETE DOCUMENT
// OWNER ONLY
// =====================================

export const deleteDocument = async (req, res) => {
    try {
        const document = await prisma.document.findFirst({
            where: {
                id: req.params.id,
                ownerId: req.user.id
            }
        });

        if (!document) {
            return res.status(404).json({
                message: "Document not found or you are not the owner"
            });
        }

        await prisma.document.delete({
            where: {
                id: document.id
            }
        });

        res.json({
            message: "Document deleted successfully"
        });

    } catch (error) {
        console.error("Delete document error:", error);

        res.status(500).json({
            message: "Could not delete document"
        });
    }
};
