import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase.config";
import Spinner from "../../components/Spinner";
function ExploreSlider() {
  const navigate = useNavigate();
  const slide = useRef(0);
  const [transform, setTransform] = useState("0%");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const listNo = useRef();
  useEffect(() => {
    const getD = async () => {
      const q = query(
        collection(db, "listings"),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const querySnap = await getDocs(q);
      querySnap.forEach((doc) => {
        const [...imgUrls] = doc.data().imgUrls;
        const { type, name, regularPrice, discountedPrice } = doc.data();
        listings.push({
          id: doc.id,
          type,
          imgUrls,
          name,
          regularPrice,
          discountedPrice,
        });
      });
      setListings(listings);
      setLoading(false);
      listNo.current = document.querySelector(".exploreSlider").children.length;
    };
    getD();
    setInterval(() => {
      slide.current = slide.current + 1;
      if (slide.current === listNo.current) {
        setTransform("0%");
        slide.current = 0;
      } else {
        setTransform(`-${slide.current * 100}%`);
      }
    }, 5000);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const goToListing = (id, type) => {
    navigate(`/category/${type}/${id}`);
  };
  return (
    <>
      {loading && <Spinner />}
      {listings.length > 0 && (
        <div className="exploreSlider">
          {listings.map((listing) =>
            listing.imgUrls.map((image) => (
              <div
                key={`${listing.id}${image}`}
                className="exp-img"
                style={{
                  transform: `translateX(${transform})`
                }}
              >
                <img src={image} alt="Explore img" onClick={() => goToListing(listing.id, listing.type)} />
                <div className="slider-det">
                  <p style={{ backgroundColor: "#2c2c2c", color: "#fff" }}>
                    House for {listing.type} {listing.name}
                  </p>
                  {listing.discountedPrice === undefined ? (
                    <p style={{ backgroundColor: "#fff", color: "#2c2c2c" }}>
                      &#8377; {listing.regularPrice?.toLocaleString()}
                      {listing.type === "rent" && "per/month"}
                    </p>
                  ) : (
                    <p style={{ backgroundColor: "#fff", color: "#2c2c2c" }}>
                      &#8377; {listing.discountedPrice?.toLocaleString()}
                      {listing.type === "rent" && " per/month"}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

export default ExploreSlider;
