import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import "./AllMedicines.css";
import MedicineDisplay from "../../components/MedicineDisplay/MedicineDisplay";

const AllMedicines = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="all-medicines">
      <div className="all-medicines-header">
        <h1>All Medicines</h1>
        <p>Browse our complete range of medicines and healthcare products</p>
      </div>

      <div className="all-medicines-search">
        <FiSearch className="all-medicines-search-icon" />
        <input
          type="text"
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <MedicineDisplay search={search} />
    </div>
  );
};

export default AllMedicines;
