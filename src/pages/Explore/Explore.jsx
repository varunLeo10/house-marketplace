import { Link } from "react-router-dom";
import SellImg from "../../assets/jpg/sellCategoryImage.jpg";
import RentImg from "../../assets/jpg/rentCategoryImage.jpg";
import "./Explore.css";
import ExploreSlider from "./ExploreSlider";
function Explore() {
  return (
    <div className="Explore">
      <header>
        <h1>Explore</h1>
        <p>Recommended</p>
      </header>
      <ExploreSlider />
      <div className="cat">
        <h1 className="cat-header">Categories</h1>
        <div className="categories">
          <Link to="/category/rent">
            <div className="cat_img">
              <img src={RentImg} alt="rent category" />
            </div>
            <p>Places for rent</p>
          </Link>
          <div className="line"></div>
          <Link to="/category/sale">
            <div className="cat_img">
              <img src={SellImg} alt="rent category" />
            </div>
            <p>Places for sale</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Explore;
