import axios from "axios";
import socket from "../socket";
import { jwtDecode } from "jwt-decode";

// Login
export const loginUser = async (identifier, password, rememberMe) => {
  try {
    const res = await axios.post("http://localhost:3000/api/login", {
      identifier,
      password,
      rememberMe,
    });

    const token = res.data.token;
    localStorage.setItem("token", token);

    // Decode and store user info
    const user = jwtDecode(token);
    localStorage.setItem("user", user.name);

    return { success: true, data: { token, user } };
  } catch (err) {
    console.error("Login failed", err);
    return { success: false, error: err };
  }
};

// Update User Status
export const activeStatus = async (status) => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.post(
      "http://localhost:3000/api/user/active-status",
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return { success: true, data: res.data };
  } catch (err) {
    console.error("Status update failed", err);
    return { success: false, error: err };
  }
};

export const inactiveStatus = async (status) => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.post(
      "http://localhost:3000/api/user/inactive-status",
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
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
    const res = await axios.post("http://localhost:3000/api/register", {
      email,
      username,
      department,
      password,
    });

    return { success: true, data: res.data };
  } catch (err) {
    console.error("Registration failed", err);
    return { success: false, error: err };
  }
};

// Logout
export const logoutUser = (navigate) => {
  try {
    // Clear auth token
    localStorage.removeItem("token");

    // Disconnect the socket if connected
    if (socket.connected) {
      socket.off();
      socket.disconnect();
    }

    // Optionally you can return a success response
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  } finally {
    navigate("/auth/login?logout_success=true");
  }
};
