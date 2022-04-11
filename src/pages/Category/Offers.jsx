import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import ListingItem from "./ListingItem";
import "./Category.css";
function Offers() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          where("offer", "==", true, orderBy("timestamp", "desc"), limit(10))
        );
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error(`Could not fetch offers`);
      }
    };
    fetchListings();
  }, []);
  return (
    <>
      {loading && <Spinner />}
      <div className="cat">
        <header>
          <h1>Offers</h1>
        </header>
        <main></main>
        {listings && listings.length > 0 ? (
          <ul>
            {listings.map((listing) => (
              <ListingItem listing={listing} key={listing.id} />
            ))}
          </ul>
        ) : (
          <p>No Offers available</p>
        )}
      </div>
    </>
  );
}

export default Offers;
