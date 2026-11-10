
export const validateDocumentUpdate = ({ title, content }) => {
  if (title === undefined && content === undefined) {
    return "No document changes provided";
  }

  if (title !== undefined && typeof title !== "string") {
    return "Title must be a string";
  }

  if (
    content !== undefined &&
    (
      typeof content !== "object" ||
      content === null ||
      Array.isArray(content) ||
      content.type !== "doc"
    )
  ) {
    return "Invalid document content";
  }

  return null;
};
