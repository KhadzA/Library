import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const viewBook = async (page = 1, limit = 10, search = "") => {
  try {
    const res = await axios.get(`${API_URL}/api/books/view-book`, {
      params: { page, limit, search },
    });
    return { success: true, data: res.data };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const addBook = async (formData) => {
  try {
    const res = await axios.post(`${API_URL}/api/books/add-book`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: res.data };
  } catch (err) {
    console.error(err);
    return { success: false, error: err };
  }
};

export const getBookMetadataByISBN = async (isbn) => {
  try {
    const res = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
    );
    const item = res.data.items?.[0]?.volumeInfo;
    if (!item) return { success: false };

    const publishedDate = item.publishedDate || "";
    return {
      success: true,
      data: {
        title: item.title || "",
        author: item.authors?.[0] || "",
        genre: item.categories?.[0] || "",
        description: item.description || "",
        published_year: publishedDate.substring(0, 4),
        published_date: publishedDate,
      },
    };
  } catch (error) {
    console.error("ISBN Fetch Error:", error);
    return { success: false, error };
  }
};

export const editBook = async (formData, bookId) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/books/edit-book/${bookId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Edit failed:", err);
    return { success: false, error: err };
  }
};

export const deleteBook = async (bookId) => {
  try {
    const res = await axios.delete(
      `${API_URL}/api/books/delete-book/${bookId}`,
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Failed to delete book:", err);
    return { success: false, error: err };
  }
};

export const toggleAvailability = async (bookId, currentAvailability) => {
  const newAvailability =
    currentAvailability === "available" ? "unavailable" : "available";
  try {
    const res = await axios.put(
      `${API_URL}/api/books/${bookId}/availability`,
      { availability: newAvailability },
      { headers: { "Content-Type": "application/json" } },
    );
    return { success: res.data.success, data: res.data };
  } catch (err) {
    console.error("Failed to toggle availability:", err);
    return { success: false, error: err };
  }
};
