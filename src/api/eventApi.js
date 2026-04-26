import axiosClient from "./axiosClient";

const eventApi = {
  getAllEvents: () => axiosClient.get("/events/get-all-events"),
  getLatestEvents: () => axiosClient.get("/events/get-latest-events"),
  createEvent: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "image" && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return axiosClient.post("/events/create-event", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateEvent: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "image" && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return axiosClient.put(`/events/update-event/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteEvent: (id) => axiosClient.delete(`/events/delete-event/${id}`),
};

export default eventApi;
