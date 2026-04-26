import axiosClient from "./axiosClient";

const adsApi = {
  getAllAds: (status) => axiosClient.get("/ads/get-all-ads", { params: { status } }),
  createAd: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "image" && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return axiosClient.post("/ads/create-ad", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateAd: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "image" && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return axiosClient.put(`/ads/update-ad/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteAd: (id) => axiosClient.delete(`/ads/delete-ad/${id}`),
};

export default adsApi;
