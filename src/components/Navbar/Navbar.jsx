import { useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as OfferIcon } from "../../assets/svg/localOfferIcon.svg";
import { ReactComponent as ExploreIcon } from "../../assets/svg/exploreIcon.svg";
import { ReactComponent as PersonOutlineIcon } from "../../assets/svg/personOutlineIcon.svg";
import "./Navbar.css";
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathMatchRoute = (route) => {
    if (location.pathname.includes("sign") && route.includes("profile"))
      return true;
    else return route === location.pathname ? true : false;
  };
  return (
    <footer className="navigation">
      <ul className="nav_links">
        <li className="nav_link-item" onClick={() => navigate("/")}>
          <ExploreIcon
            fill={pathMatchRoute("/") ? "#2c2c2c" : "#8f8f8f"}
            width="36px"
            height="36px"
          />
          <p style={{ color: pathMatchRoute("/") ? "#2c2c2c" : "#8f8f8f" }}>
            Explore
          </p>
        </li>
        <li className="nav_link-item" onClick={() => navigate("/offers")}>
          <OfferIcon
            fill={pathMatchRoute("/offers") ? "#2c2c2c" : "#8f8f8f"}
            width="36px"
            height="36px"
          />
          <p
            style={{ color: pathMatchRoute("/offers") ? "#2c2c2c" : "#8f8f8f" }}
          >
            Offers
          </p>
        </li>
        <li className="nav_link-item" onClick={() => navigate("/profile")}>
          <PersonOutlineIcon
            fill={pathMatchRoute("/profile") ? "#2c2c2c" : "#8f8f8f"}
            width="36px"
            height="36px"
          />
          <p
            style={{
              color: pathMatchRoute("/profile") ? "#2c2c2c" : "#8f8f8f",
            }}
          >
            Profile
          </p>
        </li>
      </ul>
    </footer>
  );
}

export default Navbar;
