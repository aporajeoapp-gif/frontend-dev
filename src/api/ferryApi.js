import axiosClient from "./axiosClient";

export const createFerry = async (data) => {
  const res = await axiosClient.post("/ferry/create-ferry", data);
  return res.data;
};

export const getAllFerries = async (params) => {
  const res = await axiosClient.get("/ferry/get-all-ferries", { params });
  return res.data;
};

export const updateFerry = async (id, data) => {
  const res = await axiosClient.put(`/ferry/update-ferry/${id}`, data);
  return res.data;
};

export const deleteFerry = async (id) => {
  const res = await axiosClient.delete(`/ferry/delete-ferry/${id}`);
  return res.data;
};
