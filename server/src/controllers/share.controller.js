
import prisma from "../config/database.js";

// SHARE DOCUMENT
export const shareDocument = async (req, res) => {
  try {
    const { email, permission } = req.body;
    const documentId = req.params.id;

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!["view", "edit"].includes(permission)) {
      return res.status(400).json({
        message: "Permission must be view or edit"
      });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        ownerId: req.user.id
      }
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found or you are not the owner"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({
        message: "User with this email does not exist"
      });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        message: "You cannot share a document with yourself"
      });
    }

    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId: user.id
        }
      },
      update: { permission },
      create: {
        documentId,
        userId: user.id,
        permission
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      message: "Document shared successfully",
      share
    });
  } catch (error) {
    console.error("Share error:", error);
    res.status(500).json({ message: "Could not share document" });
  }
};

// GET DOCUMENT SHARES
export const getDocumentShares = async (req, res) => {
  try {
    const document = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.id
      }
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const shares = await prisma.documentShare.findMany({
      where: { documentId: document.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ shares });
  } catch (error) {
    console.error("Get shares error:", error);
    res.status(500).json({ message: "Could not fetch shares" });
  }
};

// REMOVE ACCESS
export const removeShare = async (req, res) => {
  try {
    const share = await prisma.documentShare.findFirst({
      where: {
        id: req.params.shareId,
        document: {
          ownerId: req.user.id
        }
      }
    });

    if (!share) {
      return res.status(404).json({
        message: "Share not found"
      });
    }

    await prisma.documentShare.delete({
      where: { id: share.id }
    });

    res.json({ message: "Access removed successfully" });
  } catch (error) {
    console.error("Remove share error:", error);
    res.status(500).json({ message: "Could not remove access" });
  }
};
