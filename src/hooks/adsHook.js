import { useState, useCallback } from "react";
import adsApi from "../api/adsApi";

export const useAds = () => {
  const [ads, setAds] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAds = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await adsApi.getAllAds(params);
      if (response.data?.data) {
        setAds(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setAds(response.data);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch advertisements");
    } finally {
      setLoading(false);
    }
  }, []);

  const createAd = async (data) => {
    setLoading(true);
    try {
      await adsApi.createAd(data);
      await fetchAds();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to create advertisement" };
    } finally {
      setLoading(false);
    }
  };

  const updateAd = async (id, data) => {
    setLoading(true);
    try {
      await adsApi.updateAd(id, data);
      await fetchAds();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update advertisement" };
    } finally {
      setLoading(false);
    }
  };

  const deleteAd = async (id) => {
    setLoading(true);
    try {
      await adsApi.deleteAd(id);
      await fetchAds();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete advertisement" };
    } finally {
      setLoading(false);
    }
  };

  return {
    ads,
    pagination,
    loading,
    error,
    fetchAds,
    createAd,
    updateAd,
    deleteAd,
  };
};
