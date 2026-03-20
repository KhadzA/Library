import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/settings`;

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getProfile = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/profile`, authHeaders());
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err };
  }
};

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

export const getAvatarColor = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/avatar-color`, authHeaders());
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err };
  }
};

export const updateAvatarColor = async (color) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/avatar-color`,
      { color },
      authHeaders(),
    );
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, error: err };
  }
};
