// Foto pendiente en memoria; solo el envío confirmado se persiste en el servidor.
const drafts = new Map();
export const saveEvidenceDraft = (id, image) => drafts.set(id, image);
export const getEvidenceDraft = id => drafts.get(id) || null;
export const removeEvidenceDraft = id => drafts.delete(id);
