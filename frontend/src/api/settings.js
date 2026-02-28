import axios from "axios";

const BASE_URL = "http://localhost:3000/api/settings";

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Get current user info
export const getProfile = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/profile`, authHeaders());
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err };
  }
};

// Update account info (name, email, department)
export const updateProfile = async (name, email, department) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/profile`,
      { name, email, department },
      authHeaders(),
    );
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err };
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/password`,
      { currentPassword, newPassword },
      authHeaders(),
    );
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err };
  }
};
