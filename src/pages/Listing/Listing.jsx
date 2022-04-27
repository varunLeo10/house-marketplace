import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase.config";
import Spinner from "../../components/Spinner";
import shareIcon from "../../assets/svg/shareIcon.svg";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "./Listing.css";
function Listing() {
  const auth = getAuth();
  const params = useParams();
  const slide = useRef(0);
  const [transform, setTransform] = useState("0%");
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState({});
  const listNo = useRef();
  const [linkCopied, setLinkCopied] = useState(false);
  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, "listings", params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
      }
      listNo.current =
        document.querySelector(".listing-imgs").children.length - 1;
      setLoading(false);
    };
    fetchListing();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const slidePic = (e) => {
    if (e.target.closest(".left")) {
      slide.current = slide.current - 1;
      if (slide.current === -1) {
        setTransform(`-${(listNo.current - 1) * 100}%`);
        slide.current = listNo.current - 1;
      } else {
        setTransform(`-${slide.current * 100}%`);
      }
    }
    if (e.target.closest(".right")) {
      slide.current = slide.current + 1;
      if (slide.current === listNo.current) {
        setTransform("0%");
        slide.current = 0;
      } else {
        setTransform(`-${slide.current * 100}%`);
      }
    }
  };
  return (
    <>
      {loading && <Spinner />}

      <main className="listing-det-page">
        <div className="listing-imgs">
          {listing.imgUrls?.map((image) => (
            <div
              key={`${listing.id}${image}`}
              className="exp-img"
              style={{
                transform: `translateX(${transform})`,
              }}
            >
              <img src={image} alt="img listing" />
            </div>
          ))}
          {listing.imgUrls?.length > 1 && (
            <div className="arrow-icons" onClick={slidePic}>
              <div className="left">
                <FaArrowLeft fill="#00cc66" />
              </div>
              <div className="right">
                <FaArrowRight fill="#00cc66" />
              </div>
            </div>
          )}
        </div>
        <div className="listing-det">
          <p>{listing.name}</p>
          <p>{listing.location}</p>
          <div className="rent-sale-price">
            <button>
              {listing.type?.charAt(0).toUpperCase()}
              {listing.type?.slice(1)}
            </button>
            {listing.offer ? (
              <>
                <strike>&#8377;{listing.regularPrice?.toLocaleString()}</strike>
                <span>&#8377;{listing.discountedPrice?.toLocaleString()}</span>
              </>
            ) : (
              <p>&#8377;{listing.regularPrice?.toLocaleString()}</p>
            )}
          </div>
          <ul className="list-stats">
            <li>
              {listing.bedrooms} Bedroom{listing.bedrooms > 1 ? "s" : ""}
            </li>
            <li>
              {listing.bathrooms} Bathroom{listing.bathrooms > 1 ? "s" : ""}
            </li>
            {listing.parking && <li>Parking Spot Available</li>}
            {listing.furnished && <li>Fully Furnished</li>}
          </ul>
          {Object.keys(listing).length !== 0 && (
            <div className="Map">
              <MapContainer
                style={{ width: "100%", height: "100%" }}
                center={[listing.geolocation.lat, listing.geolocation.lng]}
                zoom={13}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[listing.geolocation.lat, listing.geolocation.lng]}
                >
                  <Popup>{listing.location}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
          {auth.currentUser?.uid !== listing.userRef && (
            <div className="contact">
              <Link
                className="contact-link"
                to={`/contact/${listing.userRef}?listingName=${listing.name}`}
              >
                Contact Landlord
              </Link>
            </div>
          )}
          <div className="sharelink">
            <div
              className="share-icon"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
            >
              <img src={shareIcon} alt="share link" />
            </div>
            {linkCopied && (
              <div className="share-text">
                {" "}
                <p>Link Copied!</p>{" "}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default Listing;
