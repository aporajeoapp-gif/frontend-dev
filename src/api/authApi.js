import axiosClient from "./axiosClient";

export const createUser = async (data) => {
  const res = await axiosClient.post("/user/createuser", data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axiosClient.post("/auth/login", data);
  return res.data;
};

export const getUser = async () => {
  const res = await axiosClient.get("/user/me");
  return res.data;
};

export const getAllUsers = async (params) => {
  const res = await axiosClient.get("/user/get-all-users", { params });
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await axiosClient.put(`/user/update-user/${id}`, data);
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axiosClient.put("/user/update-profile", data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axiosClient.delete(`/user/delete-user/${id}`);
  return res.data;
};
export const getBirthdayUsers = async () => {
  const res = await axiosClient.get("/user/birthday-users");
  return res.data;
};
