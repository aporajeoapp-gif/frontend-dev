import axiosClient from "./axiosClient";

const bloodCampApi = {
  getAllCamps: (params) => axiosClient.get("/blood-camp/get-all-camps", { params }),
  getCampById: (id) => axiosClient.get(`/blood-camp/get-camp/${id}`),
  createCamp: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "bloodGroupsNeeded") {
        formData.append(key, JSON.stringify(data[key]));
      } else if (key === "banner" && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return axiosClient.post("/blood-camp/create-camp", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateCamp: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "bloodGroupsNeeded") {
        formData.append(key, JSON.stringify(data[key]));
      } else if (key === "banner" && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return axiosClient.put(`/blood-camp/update-camp/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteCamp: (id) => axiosClient.delete(`/blood-camp/delete-camp/${id}`),
  addDonor: (data) => axiosClient.post("/blood-camp/add-donor", data),
  publicAddDonor: (data) => axiosClient.post("/blood-camp/public-add-donor", data),
  getCampDonors: (campId, params) => axiosClient.get(`/blood-camp/get-camp-donors/${campId}`, { params }),
  deleteDonor: (id) => axiosClient.delete(`/blood-camp/delete-donor/${id}`),
  approveDonor: (id) => axiosClient.patch(`/blood-camp/approve-donor/${id}`),
};

export default bloodCampApi;
