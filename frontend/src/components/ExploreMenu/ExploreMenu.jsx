import "./ExploreMenu.css";
import menu_1 from "../../assets/Menu/menu_1.png";
import menu_2 from "../../assets/Menu/menu_2.png";
import menu_3 from "../../assets/Menu/menu_3.png";
import menu_4 from "../../assets/Menu/menu_4.png";
import menu_5 from "../../assets/Menu/menu_5.png";
import menu_6 from "../../assets/Menu/menu_6.png";
import menu_7 from "../../assets/Menu/menu_7.png";
import menu_8 from "../../assets/Menu/menu_8.png";

const menuItems = [
  { img: menu_1, name: "Prescription Medicines" },
  { img: menu_2, name: "OTC Medicines" },
  { img: menu_3, name: "Health & Wellness" },
  { img: menu_4, name: "First Aid" },
  { img: menu_5, name: "Medical Devices" },
  { img: menu_6, name: "Personal Care" },
  { img: menu_7, name: "Baby Care" },
  { img: menu_8, name: "Ayurvedic & Herbal" },
];

const ExploreMenu = ({ category, setCategory }) => {
  return (
    <div className="explore-menu" id="explore-menu">
      <h1 className="explore-menu-hed">Explore Our Menu</h1>

      <p className="explore-menu-text">
        Genuine medicines and healthcare essentials, all in one trusted place.
        Carefully curated for your daily wellness and medical needs. Fast,
        secure, and reliable delivery you can depend on.
      </p>

      <div className="explore-menu-list">
        {menuItems.map((item, index) => (
          <div
            onClick={() =>
              setCategory((prev) => (prev === item.name ? "All" : item.name))
            }
            className="explore-menu-list-item"
            key={index}
          >
            <img
              className={category === item.name ? "active" : ""}
              src={item.img}
              alt={item.name}
            />
            <p>{item.name}</p>
          </div>
        ))}
      </div>

      <hr />
    </div>
  );
};

export default ExploreMenu;
