import "./List.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";

const List = () => {

  const url = "https://medicartix-backend.onrender.com";
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const res = await axios.get(`${url}/api/medicine/list`);
      if (res.data.success) {
        setList(res.data.data);
      }
    } catch {
      toast.error("Failed to load medicines");
    }
  };

  const removeMedicine = async (id) => {
    try {
      const res = await axios.post(`${url}/api/medicine/remove`, { id });
      if (res.data.success) {
        toast.success("Medicine Deleted");
        fetchList();
      }
    } catch {
      toast.error("Delete Failed");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list">

      <h2 className="list-title">All Medicines</h2>

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
              <img
                src={`${url}/images/${item.image}`}
                className="list-img"
                alt={item.name}
              />
              <p className="medicine-name">{item.name}</p>
            </div>

            <p>{item.category}</p>
            <p>₹{item.price}</p>

            <MdDelete
              className="delete-icon"
              onClick={() => removeMedicine(item._id)}
            />

          </div>
        ))}

      </div>

      <div className="mobile-cards">

        {list.map((item) => (
          <div key={item._id} className="medicine-card">

            <div className="card-left">
              <img src={`${url}/images/${item.image}`} alt={item.name} />

              <div className="medicine-info">
                <h3>{item.name}</h3>
                <p>{item.category}</p>
                <span>₹{item.price}</span>
              </div>
            </div>

            <div className="card-right">
              <MdDelete
                className="delete-icon"
                onClick={() => removeMedicine(item._id)}
              />
            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default List;
