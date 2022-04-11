import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase.config";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import googleIcon from "../assets/svg/googleIcon.svg";
import { toast } from "react-toastify";
function OAuth() {
  const location = useLocation();
  const navigate = useNavigate();
  const googleClick = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const docRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(docRef);
      if (!userSnap.exists()) {
        setDoc(docRef, {
          name: user.displayName,
          timestamp: serverTimestamp(),
        });
        toast.success("Signed up successfully using Google");
      } else {
        toast.success("Signed in successfully using Google");
      }
      navigate("/");
    } catch (error) {
      toast.error(
        `Couldn't sign ${
          location.pathname.includes("up") ? "up" : "in"
        } using Google`
      );
    }
  };
  return (
    <div className="OAuth">
      <p>Sign {location.pathname.includes("up") ? "up" : "in"} with</p>
      <button type="button" onClick={googleClick}>
        <img src={googleIcon} alt="Google Icon" />
      </button>
    </div>
  );
}

export default OAuth;
