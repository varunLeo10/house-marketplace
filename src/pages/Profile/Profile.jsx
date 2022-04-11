import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import { ReactComponent as ArrowRightIcon } from "../../assets/svg/keyboardArrowRightIcon.svg";
import { ReactComponent as HomeIcon } from "../../assets/svg/homeIcon.svg";
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
      setLoading(true);
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
      </div>
    </>
  );
}
function CreateListingLink() {
  return (
    <Link to="/create-listing" className="listing-link">
      <HomeIcon
      />
      <span>Sell or rent your home</span>
      <ArrowRightIcon
      />
    </Link>
  );
}
export default Profile;
