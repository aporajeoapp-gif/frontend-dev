import axiosClient from "./axiosClient"

export const getDoctors=async(params)=>{
    const res=await axiosClient.get("/doctor/get-all-doctors", { params })
    return res.data
}

export const createDoctor=async(data)=>{
    const res=await axiosClient.post("/doctor/create-doctor",data)
    return res.data
}

export const updateDoctor=async(id,data)=>{
    const res=await axiosClient.put(`/doctor/update-doctor/${id}`,data)
    return res.data
}

export const deleteDoctor=async(id)=>{
    const res=await axiosClient.delete(`/doctor/delete-doctor/${id}`)
    return res.data
}
