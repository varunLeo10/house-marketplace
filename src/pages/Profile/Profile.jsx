import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
  where,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import { ReactComponent as ArrowRightIcon } from "../../assets/svg/keyboardArrowRightIcon.svg";
import { ReactComponent as HomeIcon } from "../../assets/svg/homeIcon.svg";
import { ReactComponent as DeleteIcon } from "../../assets/svg/deleteIcon.svg";
import { ReactComponent as EditIcon } from "../../assets/svg/editIcon.svg";
import bathIcon from "../../assets/svg/bathtubIcon.svg";
import bedIcon from "../../assets/svg/bedIcon.svg";
import "./Profile.css";
import Spinner from "../../components/Spinner";
function Profile() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [update, setUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [phonenum, setPhonenum] = useState(null);
  useEffect(() => {
    getDocument().then((res) => {
      setFormData({
        ...formData,
        name: auth.currentUser.displayName,
        email: auth.currentUser.email,
        phoneNumber: res != null ? res : null,
      });
      res != null && setPhonenum(res);
      setLoading(false);
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getDocument = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid);
    const docu = await getDoc(docRef);
    const {
      _document: {
        data: {
          value: {
            mapValue: { fields },
          },
        },
      },
    } = docu;
    if (fields.hasOwnProperty("phoneNumber")) {
      const {
        phoneNumber: { integerValue },
      } = fields;
      return +integerValue;
    } else {
      return null;
    }
  };
  const { name, email, phoneNumber } = formData;
  const logout = async () => {
    await signOut(auth);
    toast.success("Logged Out!");
    navigate("/sign-in");
  };
  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (phoneNumber !== null) {
      if (
        phoneNumber.toString().length !== 12 &&
        phoneNumber.toString().length > 0
      ) {
        toast.error("Phone Number must be 12 digits including country code");
        setFormData({ ...formData, phoneNumber: phonenum });
        setLoading(false);
        setUpdate(!update);
        return;
      }
    }
    if (name.length > 0) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
        const userRef = doc(db, "users", auth.currentUser.uid);
        if (phoneNumber === "") {
          await updateDoc(userRef, {
            name,
            phoneNumber: null,
          });
        } else {
          await updateDoc(userRef, {
            name,
            phoneNumber: phoneNumber != null ? Number(phoneNumber) : null,
          });
        }
        toast.success("Profile details updated!");
      } catch (error) {
        setFormData({
          ...formData,
          name: auth.currentUser.displayName,
          email: auth.currentUser.email,
          phoneNumber: phonenum,
        });
        toast.error("Couldn't update profile details");
        setLoading(false);
      }
    } else {
      toast.error("Please enter Name");
      setFormData({ ...formData, name: auth.currentUser.displayName });
    }
    setLoading(false);
    setUpdate(!update);
  };
  return (
    <>
      {loading && <Spinner />}
      <div className="profile">
        <header>
          <h1>My Profile</h1>
          <button className="prof_btn" onClick={logout}>
            Logout
          </button>
        </header>
        <main>
          <div className="personalDet">
            <div>
              <h1>Personal Details</h1>
              {update || (
                <button className="prof_btn" onClick={() => setUpdate(!update)}>
                  Update
                </button>
              )}
            </div>
            {update ? (
              <form onSubmit={onSubmit}>
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  placeholder="Name"
                ></input>
                <label htmlFor="number">Mob Number:</label>
                <input
                  type="number"
                  id="phoneNumber"
                  name="number"
                  onChange={onChange}
                  value={phoneNumber}
                  placeholder="Phone Number"
                ></input>
                <label htmlFor="email">Email:</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={email}
                  disabled={true}
                  placeholder="Email"
                ></input>
                <button className="prof_btn" type="submit">
                  Done
                </button>
                <CreateListingLink />
              </form>
            ) : (
              <div className="details">
                <h2>Name:</h2>
                <p>{name}</p>
                <h2>Mob Number:</h2>
                <p>{phoneNumber ? phoneNumber : ""}</p>
                <h2>Email:</h2>
                <p>{email}</p>
                <CreateListingLink />
              </div>
            )}
          </div>
        </main>
        <UserListings />
      </div>
    </>
  );
}
function CreateListingLink() {
  return (
    <Link to="/create-listing" className="listing-link">
      <HomeIcon />
      <span>Sell or rent your home</span>
      <ArrowRightIcon />
    </Link>
  );
}
function UserListings() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchListings = async () => {
      const q = query(
        collection(db, "listings"),
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      let arr = [];
      querySnap.forEach((doc) => {
        if (doc.exists()) {
          arr.push({
            id: doc.id,
            data: doc.data(),
          });
        }
      });
      setListings(arr);
    };
    fetchListings();
    setLoading(false);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "listings", id));
        const updListing = listings.filter((listings) => listings.id !== id);
        setListings(updListing);
        toast.success("This Listing has been deleted");
      } catch (error) {
        toast.error("Couldn't delete listing please try again");
      }
      setLoading(false);
    }
  };
  const handleClick = (e, listing) => {
    if (e.target.closest(".editIcon")) {
      navigate(`/edit-listing/${listing.id}`);
      return;
    }
    if (e.target.closest(".deleteIcon")) {
      onDelete(listing.id);
      return;
    }
    if (e.target.closest(".listItem")) {
      navigate(`/category/${listing.type}/${listing.id}`);
      return;
    }
  };
  return (
    <>
      {loading && <Spinner />}
      {listings && listings.length > 0 && (
        <div className="cat">
          <header>
            <h1>Your Listings</h1>
          </header>
          <ul>
            {listings?.map((listing) => (
              <li key={listing.id}>
                <div
                  className="listItem"
                  onClick={(e) => handleClick(e, listing)}
                >
                  <img
                    className="house-img"
                    src={listing.data.imgUrls[0]}
                    alt={`${listing.data.name}`}
                  />
                  <div className="listDet">
                    <p className="location">{listing.data.location}</p>
                    <p className="name">{listing.data.name}</p>
                    <p className="price">
                      &#8377;
                      {` ${listing.data.regularPrice.toLocaleString()}`}
                      {listing.data.type === "rent" && " / Month"}
                    </p>
                    <div className="bedrooms">
                      <img src={bedIcon} alt="bed icon" />
                      <p>
                        {listing.data.bedrooms} bedroom
                        {listing.data.bedrooms > 1 ? "s" : ""}
                      </p>
                      <img src={bathIcon} alt="bath tub icon" />
                      <p>
                        {listing.data.bathrooms} bathroom
                        {listing.data.bathrooms > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="deleteIcon">
                    <DeleteIcon fill="rgb(231,76,60)" />
                  </div>
                  <div className="editIcon">
                    <EditIcon fill="#2c2c2c" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
export default Profile;
