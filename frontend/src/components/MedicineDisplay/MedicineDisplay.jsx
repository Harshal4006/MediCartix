import React, { useContext } from "react";
import "./MedicineDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import MedicineItem from "../MedicineItem/MedicineItem";

const MedicineDisplay = ({ category, search }) => {
  const { medicine_list } = useContext(StoreContext);

  return (
    <div className="medicin-display" id="medicin-display">
      <h2>Trusted Medicines for You</h2>

      <div className="medicin-display-list">
        {medicine_list.map(
          (item) =>
            (category === "All" || category === item.category) &&
            item.name.toLowerCase().includes(search.toLowerCase()) && (
              <MedicineItem
                key={item._id}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
              />
            )
        )}
      </div>
    </div>
  );
};

export default MedicineDisplay;