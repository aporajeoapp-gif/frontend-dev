import axiosClient from "./axiosClient"

export const getAllLogs=async(params = {})=>{
    const res=await axiosClient.get("/audit-logs/fetch-all", { params })
    return res.data
}

export const getAuditActions = async () => {
    const res = await axiosClient.get("/audit-logs/actions");
    return res.data;
}

export const exportAuditLogsCsv = async (params = {}) => {
    const res = await axiosClient.get("/audit-logs/export-csv", {
        params,
        responseType: "blob",
    });
    return res.data;
}

export const getLogById = async (id) => {
    const res = await axiosClient.get(`/audit-logs/fetch-single/${id}`);
    return res.data;
};
