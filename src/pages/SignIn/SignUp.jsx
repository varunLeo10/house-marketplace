import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db } from "../../firebase.config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import PersonIcon from "../../assets/svg/personIcon.svg";
import LockIcon from "../../assets/svg/lockIcon.svg";
import BadgeIcon from "../../assets/svg/badgeIcon.svg";
import { ReactComponent as ArrowRightIcon } from "../../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from "../../assets/svg/visibilityIcon.svg";
import "./SignIn.css";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import OAuth from "../../components/OAuth";
function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const { email, password, name } = formData;
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (email.length !== 0 && password.length !== 0) {
        setLoading(true);
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        updateProfile(user, {
          displayName: name,
        });
        const formDataCopy = { ...formData };
        delete formDataCopy.password;
        formDataCopy.timestamp = serverTimestamp();
        await setDoc(doc(db, "users", user.uid), formDataCopy);
        setLoading(false);
        toast.success("Account created!");
        navigate("/");
      } else {
        if (email.length === 0) {
          toast.error("Please enter email");
        } else {
          toast.error("Please enter password");
        }
      }
    } catch (error) {
      toast.error("Something went wrong with registration!");
      setLoading(false);
    }
  };
  return (
    <>
      {loading && <Spinner />}
      <div className="sign_in-container">
        <header>
          <h1>Sign Up</h1>
        </header>
        <main className="sign_in-form">
          <form onSubmit={onSubmit}>
            <input
              type="text"
              id="name"
              placeholder="Name"
              value={name}
              onChange={handleChange}
              autoComplete="off"
              style={{
                background: `url(${BadgeIcon}) #fff 2.5% center no-repeat`,
              }}
            ></input>
            <input
              type="text"
              id="email"
              placeholder="Email"
              value={email}
              onChange={handleChange}
              autoComplete="off"
              style={{
                background: `url(${PersonIcon}) #fff 2.5% center no-repeat`,
              }}
            ></input>
            <div className="inputPass">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                value={password}
                onChange={handleChange}
                style={{
                  display: "inline",
                  background: `url(${LockIcon}) #fff 2.5% center no-repeat`,
                }}
                autoComplete="off"
              ></input>
              <img
                className="show-hide"
                src={visibilityIcon}
                alt="show password"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
            <Link
              style={{
                color: "#00cc66",
                cursor: "pointer",
                textAlign: "right",
                fontWeight: "600",
              }}
              to="/forgot-password"
            >
              Forgot Password
            </Link>
            <div className="sign_in-bar">
              <p>Sign Up</p>
              <button type="submit">
                <ArrowRightIcon fill="#ffffff" />
              </button>
            </div>
            <OAuth />
            <Link
              style={{
                color: "#00cc66",
                cursor: "pointer",
                textAlign: "center",
                fontWeight: "600",
                display: "block",
                marginTop: "3rem",
              }}
              to="/sign-in"
            >
              Sign In Instead
            </Link>
          </form>
        </main>
      </div>
    </>
  );
}

export default SignUp;
