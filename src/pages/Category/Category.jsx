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
function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          where(
            "type",
            "==",
            params.categoryName,
            orderBy("timestamp", "desc"),
            limit(10)
          )
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
        toast.error(`Could not fetch ${params.categoryName} listings`);
      }
    };
    fetchListings();
  }, []);
  return (
    <>
      {loading && <Spinner />}
      <div className="cat">
        <header>
          <h1>Places for {params.categoryName}</h1>
        </header>
        <main></main>
        {listings && listings.length > 0 ? (
          <ul>
            {listings.map((listing) => (
              <ListingItem listing={listing} key={listing.id} />
            ))}
          </ul>
        ) : (
          <p>No Listings available for {params.categoryName}</p>
        )}
      </div>
    </>
  );
}

export default Category;
