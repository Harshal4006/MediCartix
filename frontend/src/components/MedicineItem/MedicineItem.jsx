import { useContext } from "react";
import "./MedicineItem.css";
import add_icon_white from "../../assets/images/add_icon_white.png";
import remove_icon_red from "../../assets/images/remove_icon_red.png";
import add_icon_green from "../../assets/images/add_icon_green.png";
import { StoreContext } from "../../context/StoreContext";
import { Link } from "react-router-dom";

const MedicineItem = ({ id, name, price, description, image }) => {

  const { url, cartItems, addToCart, removeFromCart } = useContext(StoreContext);

  const imgSrc = image?.startsWith("/") ? image : `${url}/images/${image}`;

  return (
    <div className="medicin-item">
      <Link to={`/medicine/${id}`} className="medicin-item-link">
        <div className="medicin-item-img-container">
          <img
            className="medicin-item-image"
            src={imgSrc}
            alt={name}
            loading="lazy"
          />

          {!cartItems[id] ? (
            <img
              className="add"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(id); }}
              src={add_icon_white}
              alt=""
            />
          ) : (
            <div className="medicin-item-counter">
              <img onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromCart(id); }} src={remove_icon_red} alt="" />
              <p>{cartItems[id]}</p>
              <img onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(id); }} src={add_icon_green} alt="" />
            </div>
          )}
        </div>

        <div className="medicin-item-info">
          <div className="medicin-item-name-rating">
            <p>{name}</p>
            <div className="rating">★★★★☆</div>
          </div>

          <p className="medicin-item-desc">{description}</p>
          <p className="medicin-item-price">₹ {price}</p>
        </div>
      </Link>
    </div>
  );
};

export default MedicineItem;
