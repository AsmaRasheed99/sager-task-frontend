import React from "react";
import bell from "../assets/bell.svg";
import lang from "../assets/language-svgrepo-com.svg";
import capture from "../assets/capture-svgrepo-com.svg";
import "../styles/Header.css";

const Header: React.FC = () => {
  return (
    <div className="header-container">
     {/* left side  */}
      <div className="header-left">
        <div className="logo">
          SAGER
        </div>
      </div>

      {/* Right side */}
      <div className="header-right">
        <img 
          src={capture} 
          alt="capture" 
          className="icon-button" 
        />
        <img 
          src={lang} 
          alt="Languages" 
          className="icon-button" 
        />
        
        <div className="notification-bell">
          <img 
            src={bell} 
            alt="Notifications" 
            className="icon-button" 
          />
          <div className="notification-dot"></div>
        </div>

        {/* user info */}
        <div className="user-info">
        </div>
      </div>
    </div>
  );
};

export default Header;