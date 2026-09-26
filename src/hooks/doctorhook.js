import { useCallback, useState } from "react";
import { getDoctors } from "../api/doctorApi";

export default function useDoctors() {
    const [doctors, setDoctors] = useState([])
    const [pagination, setPagination] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchDoctors = useCallback(async (params = {}) => {
        try {
            setLoading(true)
            const response = await getDoctors(params)
            if (response.data) {
                setDoctors(response.data)
                setPagination(response.pagination)
            } else {
                setDoctors(response)
            }
            setError(null)
            return response
        } catch (err) {
            setError(err)
            setDoctors([])
            setPagination(null)
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        doctors,
        pagination,
        loading,
        error,
        refresh: fetchDoctors
    }
}
