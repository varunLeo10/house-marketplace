import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import PersonIcon from "../../assets/svg/personIcon.svg";
import LockIcon from "../../assets/svg/lockIcon.svg";
import { ReactComponent as ArrowRightIcon } from "../../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from "../../assets/svg/visibilityIcon.svg";
import Spinner from "../../components/Spinner";
import OAuth from "../../components/OAuth";
import "./SignIn.css";
function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (email.length !== 0 && password.length !== 0) {
        setLoading(true);
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        setLoading(false);
        userCredential.user && navigate("/");
        toast.success("Logged In!");
      } else {
        if (email.length === 0) {
          toast.error("Please enter email");
        } else {
          toast.error("Please enter password");
        }
      }
    } catch (error) {
      toast.error("Bad user credentials!");
      setLoading(false);
    }
  };
  return (
    <>
      {loading && <Spinner />}
      <div className="sign_in-container">
        <header>
          <h1>Sign in</h1>
        </header>
        <main className="sign_in-form">
          <form onSubmit={onSubmit}>
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
                autoComplete="off"
                style={{
                  background: `url(${LockIcon}) #fff 2.5% center no-repeat`,
                  display: "inline",
                }}
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
              to={`/forgot-password/${email}`}
            >
              Forgot Password
            </Link>
            <div className="sign_in-bar">
              <p>Sign In</p>
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
              to="/sign-up"
            >
              Sign Up Instead
            </Link>
          </form>
        </main>
      </div>
    </>
  );
}

export default SignIn;
