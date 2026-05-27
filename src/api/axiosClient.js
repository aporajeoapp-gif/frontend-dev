import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://7l4sl9hi6c.execute-api.ap-south-1.amazonaws.com/api/v1",
});

//https://7l4sl9hi6c.execute-api.ap-south-1.amazonaws.com
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;