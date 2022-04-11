import { useState } from "react";
import PersonIcon from "../assets/svg/personIcon.svg";
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  let { email } = useParams();
  const [change, setChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  if (email === undefined) {
    email = "";
  }
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      if (change) {
        if (newEmail.length === 0) {
          toast.error("Please enter email");
        } else {
          setLoading(true);
          await sendPasswordResetEmail(auth, newEmail);
          setLoading(false);
          toast.success("Reset password link sent to email");
          navigate("/sign-in");
        }
      } else {
        if (email.length === 0) {
          toast.error("Please enter email");
        } else {
          setLoading(true);
          await sendPasswordResetEmail(auth, email);
          setLoading(false);
          toast.success("Reset password link sent to email");
          navigate("/sign-in");
        }
      }
    } catch (error) {
      toast.error("Could not send reset password link");
    }
  };
  const handleChange = (e) => {
    setChange(true);
    setNewEmail(e.target.value);
  };
  return (
    <>
      {loading && <Spinner />}
      <div className="sign_in-container">
        <header>
          <h1>Forgot Password</h1>
        </header>
        <main className="sign_in-form">
          <form onSubmit={onSubmit}>
            <input
              type="text"
              id="email"
              placeholder="Email"
              value={change ? newEmail : email}
              onChange={handleChange}
              autoComplete="off"
              style={{
                background: `url(${PersonIcon}) #fff 2.5% center no-repeat`,
              }}
            ></input>
            <div className="sign_in-bar">
              <p>Send Reset Link</p>
              <button type="submit">
                <ArrowRightIcon fill="#ffffff" />
              </button>
            </div>
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
              Sign In Instead
            </Link>
          </form>
        </main>
      </div>
    </>
  );
}

export default ForgotPassword;
