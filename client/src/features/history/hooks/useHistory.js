import { useState, useEffect, useCallback } from "react";
import { getHistory, deleteHistory as deleteHistoryAPI } from "../../../shared/services/history.service";

export const useHistory = () => {
  const [histories, setHistories] = useState([]);
  const [filter, setFilter] = useState("30days");
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHistory(filter);
      setHistories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (type) => {
    if (!window.confirm(`Xác nhận xoá lịch sử ${type === "all" ? "tất cả" : "7 ngày qua"}?`)) return;
    await deleteHistoryAPI(type);
    fetchHistory();
  };

  return { histories, filter, setFilter, loading, handleDelete };
};