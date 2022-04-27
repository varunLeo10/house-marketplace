import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import ListingItem from "./ListingItem";
import "./Category.css";
function Offers() {
  const auth = getAuth();
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(10)
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
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error(`Could not fetch offers`);
      }
    };
    fetchListings();
  }, []);
  const onFetchMore = async () => {
    try {
      setLoading(true);
      if (lastFetchedListing) {
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          startAfter(lastFetchedListing),
          limit(10)
        );
        const querySnap = await getDocs(q);
        const moreListings = [];
        querySnap.forEach((doc) => {
          moreListings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        if (
          moreListings.length === 0 ||
          moreListings[moreListings.length - 1].id ===
            listings[listings.length - 1].id
        ) {
          setLastFetchedListing(null);
        } else {
          setListings((prevState) => [...prevState, ...moreListings]);
          const lastVisible = querySnap.docs[querySnap.docs.length - 1];
          setLastFetchedListing(lastVisible);
        }
      }
      setLoading(false);
    } catch (error) {
      toast.error("Couldn't fetch more listings");
      setLoading(false);
    }
  };
  const onDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "listings", id));
        const updListing = listings.filter((listing) => listing.id !== id);
        setListings(updListing);
        toast.success("This Listing has been deleted");
      } catch (error) {
        toast.error("Couldn't delete listing please try again");
      }
      setLoading(false);
    }
  };
  return (
    <>
      {loading && <Spinner />}
      <div className="cat">
        <header>
          <h1>Offers</h1>
        </header>
        <main></main>
        {listings && listings.length > 0 ? (
          <>
            <ul>
              {listings.map((listing) => (
                <ListingItem
                  listing={listing}
                  key={listing.id}
                  deletion={
                    listing.data.userRef === auth.currentUser.uid && onDelete
                  }
                  edit={listing.data.userRef === auth.currentUser.uid}
                />
              ))}
            </ul>
            {lastFetchedListing && (
              <div className="loadmore">
                <button onClick={onFetchMore}>Fetch More</button>
              </div>
            )}
          </>
        ) : (
          <p>No Offers available</p>
        )}
      </div>
    </>
  );
}

export default Offers;
