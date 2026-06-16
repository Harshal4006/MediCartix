import { useContext, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiShield, FiTruck, FiRefreshCw, FiZap } from "react-icons/fi";
import "./MedicineDetail.css";
import remove_icon_red from "../../assets/images/remove_icon_red.png";
import add_icon_green from "../../assets/images/add_icon_green.png";
import add_icon_white from "../../assets/images/add_icon_white.png";
import { StoreContext } from "../../context/StoreContext";
import MedicineItem from "../../components/MedicineItem/MedicineItem";

const HIGHLIGHTS = [
  { icon: <FiShield />, title: "100% Genuine", desc: "Authentic products sourced directly from licensed manufacturers" },
  { icon: <FiTruck />, title: "Free Delivery", desc: "Free shipping on all orders above ₹299" },
  { icon: <FiRefreshCw />, title: "Easy Returns", desc: "Hassle-free returns within 7 days of delivery" },
];

const REVIEWS = [
  { name: "Priya Sharma", rating: 5, date: "2 weeks ago", text: "Very effective medicine. Worked exactly as expected. Will order again." },
  { name: "Rahul Verma", rating: 4, date: "1 month ago", text: "Good quality product. Delivery was on time and packaging was secure." },
  { name: "Anjali Patel", rating: 5, date: "3 weeks ago", text: "Great value for money. Highly recommend this medicine." },
];

const FAQS = [
  { q: "Is this medicine safe to use?", a: "Yes, when used as directed by your healthcare provider. Always follow the prescribed dosage and consult your doctor if you have any concerns." },
  { q: "How should I store this medicine?", a: "Store in a cool, dry place away from direct sunlight and moisture. Keep out of reach of children. Do not use after the expiry date." },
  { q: "Can I take this with other medications?", a: "Please consult your doctor before combining with other medications. Some medicines may interact and cause adverse effects." },
  { q: "What if I miss a dose?", a: "Take the missed dose as soon as you remember. If it is almost time for your next dose, skip the missed one. Do not double the dose." },
];

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { url, medicine_list, cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const [openFaq, setOpenFaq] = useState(null);

  const item = useMemo(() => medicine_list.find((m) => m._id === id), [medicine_list, id]);

  const similar = useMemo(
    () => (item ? medicine_list.filter((m) => m.category === item.category && m._id !== item._id).slice(0, 5) : []),
    [medicine_list, item]
  );

  const handleBuyNow = () => {
    if (!cartItems[item._id]) {
      addToCart(item._id);
    }
    navigate("/order");
  };

  if (!item) {
    return (
      <div className="detail-page">
        <div className="detail-not-found">
          <h2>Medicine not found</h2>
          <Link to="/" className="detail-back-link">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const imgSrc = item.image?.startsWith("/") ? item.image : `${url}/images/${item.image}`;

  return (
    <div className="detail-page">
      <Link to="/" className="detail-back"><FiArrowLeft /> Back to Medicines</Link>

      <div className="detail-card">
        <div className="detail-image-wrap">
          <img src={imgSrc} alt={item.name} />
        </div>

        <div className="detail-info">
          <span className="detail-category">{item.category}</span>
          <h1>{item.name}</h1>

          <div className="detail-rating-row">
            <div className="stars">★★★★☆</div>
            <span className="rating-text">4.2 (128 reviews)</span>
          </div>

          <p className="detail-desc">{item.description}</p>

          <div className="detail-price-row">
            <span className="detail-price">₹{item.price}</span>
            <span className="detail-mrp">₹{Math.round(item.price * 1.25)}</span>
            <span className="detail-discount">25% OFF</span>
          </div>

          <div className="detail-actions">
            {!cartItems[item._id] ? (
              <button className="detail-add-btn" onClick={() => addToCart(item._id)}>
                <img src={add_icon_white} alt="" />
                Add to Cart
              </button>
            ) : (
              <div className="detail-counter">
                <button onClick={() => removeFromCart(item._id)}>
                  <img src={remove_icon_red} alt="" />
                </button>
                <span>{cartItems[item._id]}</span>
                <button onClick={() => addToCart(item._id)}>
                  <img src={add_icon_green} alt="" />
                </button>
              </div>
            )}
            <button className="detail-buy-btn" onClick={handleBuyNow}>
              <FiZap />
              Buy Now
            </button>
            <span className="detail-free-delivery">✓ Free Delivery</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>Why Buy From Us</h3>
        <div className="highlights-grid">
          {HIGHLIGHTS.map((h, i) => (
            <div className="highlight-card" key={i}>
              <div className="highlight-icon">{h.icon}</div>
              <div>
                <h4>{h.title}</h4>
                <p>{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <h3>Product Details</h3>
        <div className="details-table">
          <div className="dt-row"><span>Category</span><span>{item.category}</span></div>
          {item.form && <div className="dt-row"><span>Form</span><span>{item.form}</span></div>}
          {item.packSize && <div className="dt-row"><span>Pack Size</span><span>{item.packSize}</span></div>}
          {item.manufacturer && <div className="dt-row"><span>Manufacturer</span><span>{item.manufacturer}</span></div>}
          {item.countryOfOrigin && <div className="dt-row"><span>Country of Origin</span><span>{item.countryOfOrigin}</span></div>}
          <div className="dt-row"><span>Prescription Required</span><span>{item.prescriptionRequired ? "Yes" : "No"}</span></div>
          {item.expiryMonths && <div className="dt-row"><span>Expiry</span><span>{item.expiryMonths} months from manufacture</span></div>}
        </div>
      </div>

      <div className="detail-section">
        <div className="section-title-row">
          <h3>Customer Reviews</h3>
          <div className="overall-rating">
            <span className="rating-big">4.2</span>
            <div className="stars">★★★★☆</div>
            <span className="rating-count">128 reviews</span>
          </div>
        </div>
        <div className="reviews-list">
          {REVIEWS.map((r, i) => (
            <div className="review-card" key={i}>
              <div className="review-header">
                <div className="review-avatar">{r.name[0]}</div>
                <div>
                  <p className="review-name">{r.name}</p>
                  <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                </div>
                <span className="review-date">{r.date}</span>
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={i}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                {openFaq === i ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {similar.length > 0 && (
        <div className="detail-similar">
          <h3>More in {item.category}</h3>
          <div className="similar-grid">
            {similar.map((m) => (
              <MedicineItem key={m._id} id={m._id} name={m.name} description={m.description} price={m.price} image={m.image} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineDetail;
