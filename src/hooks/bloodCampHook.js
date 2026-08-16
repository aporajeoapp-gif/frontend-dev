import { useState, useCallback } from "react";
import bloodCampApi from "../api/bloodCampApi";

export const useBloodCamp = () => {
  const [camps, setCamps] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCamps = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await bloodCampApi.getAllCamps(params);
      if (response.data?.data) {
        setCamps(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setCamps(response.data);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch camps");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCampById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await bloodCampApi.getCampById(id);
      setError(null);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch camp details");
      return { success: false, message: err.response?.data?.message || "Failed to fetch camp details" };
    } finally {
      setLoading(false);
    }
  }, []);

  const createCamp = useCallback(async (data) => {
    setLoading(true);
    try {
      await bloodCampApi.createCamp(data);
      await fetchCamps();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to create camp" };
    } finally {
      setLoading(false);
    }
  }, [fetchCamps]);

  const updateCamp = useCallback(async (id, data) => {
    setLoading(true);
    try {
      await bloodCampApi.updateCamp(id, data);
      await fetchCamps();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update camp" };
    } finally {
      setLoading(false);
    }
  }, [fetchCamps]);

  const deleteCamp = useCallback(async (id) => {
    setLoading(true);
    try {
      await bloodCampApi.deleteCamp(id);
      await fetchCamps();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete camp" };
    } finally {
      setLoading(false);
    }
  }, [fetchCamps]);

  const addDonor = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await bloodCampApi.addDonor(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to add donor" };
    } finally {
      setLoading(false);
    }
  }, []);

  const publicAddDonor = useCallback(async (data) => {
    setLoading(true);
    try {
      const response = await bloodCampApi.publicAddDonor(data);
      return { success: true, message: response.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmDonorApproval = useCallback(async (id) => {
    setLoading(true);
    try {
      await bloodCampApi.approveDonor(id);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to approve donor" };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDonors = useCallback(async (campId, params = {}) => {
    setLoading(true);
    try {
      const response = await bloodCampApi.getCampDonors(campId, params);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to fetch donors" };
    } finally {
      setLoading(false);
    }
  }, []);

  const removeDonor = useCallback(async (id) => {
    setLoading(true);
    try {
      await bloodCampApi.deleteDonor(id);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete donor" };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    camps,
    pagination,
    loading,
    error,
    fetchCamps,
    fetchCampById,
    createCamp,
    updateCamp,
    deleteCamp,
    addDonor,
    publicAddDonor,
    confirmDonorApproval,
    fetchDonors,
    removeDonor,
  };
};
