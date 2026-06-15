import React, { useContext } from "react";
import "./MedicineDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import MedicineItem from "../MedicineItem/MedicineItem";

const MedicineDisplay = ({ category, search }) => {
  const { medicine_list, medicineLoading } = useContext(StoreContext);

  const filtered = medicine_list.filter(
    (item) =>
      (category === "All" || category === item.category) &&
      item.name.toLowerCase().includes((search || "").toLowerCase())
  );

  if (medicineLoading) {
    return (
      <div className="medicin-display" id="medicin-display">
        <h2>Trusted Medicines for You</h2>
        <div className="medicin-display-list">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="medicin-skeleton-card">
              <div className="skeleton-img" />
              <div className="skeleton-body">
                <div className="skeleton-line w-70" />
                <div className="skeleton-line w-50" />
                <div className="skeleton-line w-30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!medicineLoading && filtered.length === 0) {
    return (
      <div className="medicin-display" id="medicin-display">
        <h2>Trusted Medicines for You</h2>
        <div className="medicin-empty">
          <p>No medicines found{search ? ` matching "${search}"` : ""}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medicin-display" id="medicin-display">
      <h2>Trusted Medicines for You</h2>
      <div className="medicin-display-list">
        {filtered.map((item) => (
          <MedicineItem
            key={item._id}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default MedicineDisplay;
