import React from "react";
import "./Footer.css";
import facebook_icon from "../../assets/images/facebook_icon.png";
import linkedin_icon from "../../assets/images/linkedin_icon.png";
import twitter_icon from "../../assets/images/twitter_icon.png";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
            <h2 className="footer-content-left-hed">MediCartix</h2>
            <p>
                MediCartix is your trusted online pharmacy delivering genuine
                medicines, healthcare devices, and wellness essentials right to your
                doorstep with safety, speed, and care.
            </p>
          <div className="footer-social-icon">
                <img src={facebook_icon} alt="Facebook" />
                <img src={linkedin_icon} alt="LinkedIn" />
                <img src={twitter_icon} alt="Twitter" />
          </div>
        </div>

        <div className="footer-content-center">
            <h2>COMPANY</h2>
            <ul>
                <li>Home</li>
                <li>About MediCartix</li>
                <li>Order Medicines</li>
                <li>Privacy Policy</li>
            </ul>
        </div>

        <div className="footer-content-right">
            <h2>GET IN TOUCH</h2>
            <ul>
                <li>+91-0000000000</li>
                <li>support@medicartix.com</li>
            </ul>
        </div>
      </div>

      <hr />

      <p className="footer-copyright">
        © 2026 MediCartix.com — All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
