import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const getNotes = () => api.get("/notes/");
export const createNote = (data) => api.post("/notes/", data, {
  headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
});
export const updateNote = (id, data) => api.patch(`/notes/${id}/`, data, {
  headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
});
export const deleteNote = (id) => api.delete(`/notes/${id}/`);
export const uploadToS3 = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post("/notes/upload-s3/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
