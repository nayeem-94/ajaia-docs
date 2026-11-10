
import test from "node:test";
import assert from "node:assert/strict";
import { validateDocumentUpdate } from "../src/utils/documentValidation.js";

test("should reject an empty update", () => {
  assert.equal(
    validateDocumentUpdate({}),
    "No document changes provided"
  );
});

test("should accept a valid title", () => {
  assert.equal(
    validateDocumentUpdate({ title: "My Document" }),
    null
  );
});

test("should reject a non-string title", () => {
  assert.equal(
    validateDocumentUpdate({ title: 123 }),
    "Title must be a string"
  );
});

test("should reject invalid document content", () => {
  assert.equal(
    validateDocumentUpdate({ content: { type: "paragraph" } }),
    "Invalid document content"
  );
});

test("should accept valid Tiptap content", () => {
  assert.equal(
    validateDocumentUpdate({
      content: {
        type: "doc",
        content: [{ type: "paragraph" }]
      }
    }),
    null
  );
});

