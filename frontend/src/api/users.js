import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const viewUsers = async (page = 1, limit = 10, search = "") => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/api/users/all`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit, search },
    });

    return {
      success: true,
      users: res.data.users,
      total: res.data.total,
      page: res.data.page,
      limit: res.data.limit,
    };
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return { success: false, error: err };
  }
};

export const viewUser = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.get(`${API_URL}/api/users/${id}/view`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { success: true, user: res.data.user };
  } catch (err) {
    console.error("Failed to fetch user:", err);
    return { success: false, error: err };
  }
};

export const addUser = async (form) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${API_URL}/api/users/add`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { success: true, userId: res.data.userId };
  } catch (err) {
    console.error("Add user failed:", err);
    return { success: false, error: err };
  }
};

export const editUser = async (data) => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.put(`${API_URL}/api/users/${data.id}/edit`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err) {
    console.error("Edit user failed:", err);
    return { success: false, error: err };
  }
};

export const deleteUser = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.delete(`${API_URL}/api/users/${id}/delete`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (err) {
    console.error("Delete user failed:", err);
    return { success: false, error: err };
  }
};

export const toggleStatus = async (userId, currentStatus) => {
  let newStatus = null;

  if (currentStatus === "active") newStatus = "suspended";
  else if (currentStatus === "suspended") newStatus = "active";
  else if (currentStatus === "inactive") newStatus = "suspended";
  else return { success: false, error: "Invalid current status" };

  try {
    const res = await axios.put(
      `${API_URL}/api/users/${userId}/status`,
      { status: newStatus },
      { headers: { "Content-Type": "application/json" } },
    );

    return { success: res.data.success, newStatus };
  } catch (err) {
    console.error("Failed to toggle status:", err);
    return { success: false, error: err };
  }
};
