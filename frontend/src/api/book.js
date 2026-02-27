import axios from 'axios';

export const viewBook = async (page = 1, limit = 10, search = '') => {
  try {
    const res = await axios.get('http://localhost:3000/api/books/view-book', {
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
    const res = await axios.post(
      'http://localhost:3000/api/books/add-book',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error(err);
    return { success: false, error: err };
  }
};

export const getBookMetadataByISBN = async (isbn) => {
  try {
    const res = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    );
    const item = res.data.items?.[0]?.volumeInfo;
    if (!item) return { success: false };

    const publishedDate = item.publishedDate || ""; // e.g., "1997-06-26"

    return {
      success: true,
      data: {
        title: item.title || "",
        author: item.authors?.[0] || "",
        genre: item.categories?.[0] || "",
        description: item.description || "",
        published_year: publishedDate.substring(0, 4), // Just the year
        published_date: publishedDate, // Full raw value
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
      `http://localhost:3000/api/books/edit-book/${bookId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Edit failed:', err);
    return { success: false, error: err };
  }
};



export const deleteBook = async (bookId) => {
  try {
    const res = await axios.delete(`http://localhost:3000/api/books/delete-book/${bookId}`);
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Failed to delete book:', err);
    return { success: false, error: err };
  }
};


export const toggleAvailability = async (bookId, currentAvailability) => {
  const newAvailability = currentAvailability === 'available' ? 'unavailable' : 'available';

  try {
    const res = await fetch(`http://localhost:3000/api/books/${bookId}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availability: newAvailability }),
    });

    const data = await res.json();
    return { success: data.success, data };
  } catch (err) {
    console.error('Failed to toggle availability:', err);
    return { success: false, error: err };
  }
};

