import axiosClient from "./axiosClient";

export const createBus = async (data) => {
  const res = await axiosClient.post("/bus/create-bus", data);
  return res.data;
};

export const getAllBuses = async (params) => {
  const res = await axiosClient.get("/bus/get-all-buses", { params });
  return res.data;
};

export const updateBus = async (id, data) => {
  const res = await axiosClient.put(`/bus/update-bus/${id}`, data);
  return res.data;
};

export const deleteBus = async (id) => {
  const res = await axiosClient.delete(`/bus/delete-bus/${id}`);
  return res.data;
};
