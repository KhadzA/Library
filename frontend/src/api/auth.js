import axios from "axios";
import socket from "../socket";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL;

// Login
export const loginUser = async (identifier, password, rememberMe) => {
  try {
    const res = await axios.post(`${API_URL}/api/login`, {
      identifier,
      password,
      rememberMe,
    });

    const token = res.data.token;
    localStorage.setItem("token", token);

    const user = jwtDecode(token);
    localStorage.setItem("user", user.name);

    return { success: true, data: { token, user } };
  } catch (err) {
    console.error("Login failed", err);
    return { success: false, error: err };
  }
};

// Update User Status
export const activeStatus = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `${API_URL}/api/user/active-status`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Status update failed", err);
    return { success: false, error: err };
  }
};

export const inactiveStatus = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `${API_URL}/api/user/inactive-status`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Status update failed", err);
    return { success: false, error: err };
  }
};

// Register
export const registerUser = async (email, username, department, password) => {
  try {
    const res = await axios.post(`${API_URL}/api/register`, {
      email,
      username,
      department,
      password,
    });
    return { success: true, data: res.data };
  } catch (err) {
    // Pull the actual message from the backend response
    const message = err.response?.data?.message || "Registration failed";
    return { success: false, error: err, message };
  }
};

// Logout
export const logoutUser = (navigate) => {
  try {
    localStorage.removeItem("token");
    if (socket.connected) {
      socket.off();
      socket.disconnect();
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  } finally {
    navigate("/auth/login?logout_success=true");
  }
};
