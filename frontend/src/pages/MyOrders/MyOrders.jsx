import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { FaBoxOpen } from "react-icons/fa";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const response = await axios.post(
      `${url}/api/order/userorders`,
      {},
      { headers: { token } },
    );

    if (response.data.success) {
      setOrders(response.data.data);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="myorders">
      <h2>My Orders</h2>

      <div className="orders-container">
        {orders.map((order, index) => {
          return (
            <div className="order-row" key={index}>
              <FaBoxOpen className="order-icon" />

              <p className="order-items">
                {order.items.map((item, i) => (
                  <span key={i}>
                    {item.name} x {item.quantity}
                    {i !== order.items.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>

              <p className="order-price">₹{order.amount}</p>

              <p className="order-count">Items: {order.items.length}</p>

              <p className="order-status">● {order.status}</p>

              <button onClick={fetchOrders}>Track Order</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
