
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/dashboard';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get books added per month (analytics)
export const booksPerMonth = async () => {
  try {
    const res = await axios.get(`${API_BASE}/analytics/books-per-month`, getAuthHeaders());
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Failed to fetch books per month:', err);
    return { success: false, error: err };
  }
};

export const userStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/stats/users`, getAuthHeaders());
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Failed to fetch user stats:', err);
    return { success: false, error: err };
  }
};

// Get the top user with the most reading time
export const topReader = async () => {
  try {
    const res = await axios.get(`${API_BASE}/stats/top-reader`, getAuthHeaders());
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Failed to fetch top reader:', err);
    return { success: false, error: err };
  }
};

export const bookStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/stats/books`, getAuthHeaders());
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Failed to fetch book stats:', err);
    return { success: false, error: err };
  }
};

export const readingStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/stats/reading`, getAuthHeaders());
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Failed to fetch reading stats:', err);
    return { success: false, error: err };
  }
};

export const recentActivity = async () => {
  try {
    const res = await axios.get(`${API_BASE}/recent-activity`, getAuthHeaders());
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Failed to fetch recent activity:', err);
    return { success: false, error: err };
  }
};

