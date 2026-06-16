import "./List.css";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";

const List = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const token = localStorage.getItem("adminToken");

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);

  const fetchList = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${url}/api/medicine/list?page=${pageNum}&limit=50`);
      if (res.data.success) {
        if (pageNum === 1) {
          setList(res.data.data);
        } else {
          setList((prev) => [...prev, ...res.data.data]);
        }
        setHasMore(res.data.pagination?.hasMore || false);
      }
    } catch {
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  const removeMedicine = async (id) => {
    if (!token) {
      toast.error("Please login as admin");
      return;
    }
    try {
      const res = await axios.post(`${url}/api/medicine/remove`, { id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Medicine Deleted");
        fetchList(1);
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch {
      toast.error("Delete Failed");
    }
  };

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && list.length === 0) {
    return (
      <div className="list">
        <h2 className="list-title">All Medicines</h2>
        <div className="list-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="list">
      <h2 className="list-title">All Medicines ({list.length})</h2>

      <div className="desktop-table">
        <div className="list-table-format title">
          <b>Medicine</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>

        {list.map((item) => (
          <div key={item._id} className="list-table-format">
            <div className="name-cell">
              <img src={`${url}/images/${item.image}`} className="list-img" alt={item.name} loading="lazy" />
              <p className="medicine-name">{item.name}</p>
            </div>
            <p>{item.category}</p>
            <p>₹{item.price}</p>
            <MdDelete className="delete-icon" onClick={() => removeMedicine(item._id)} />
          </div>
        ))}
      </div>

      <div className="mobile-cards">
        {list.map((item) => (
          <div key={item._id} className="medicine-card">
            <div className="card-left">
              <img src={`${url}/images/${item.image}`} alt={item.name} loading="lazy" />
              <div className="medicine-info">
                <h3>{item.name}</h3>
                <p>{item.category}</p>
                <span>₹{item.price}</span>
              </div>
            </div>
            <div className="card-right">
              <MdDelete className="delete-icon" onClick={() => removeMedicine(item._id)} />
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more" style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => { pageRef.current += 1; fetchList(pageRef.current); }} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default List;
