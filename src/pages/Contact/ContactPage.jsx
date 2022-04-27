import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";
import "./Contact.css";
function ContactPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [landlord, setLandlord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const getLandlord = async () => {
      const docRef = doc(db, "users", params.landlordId);
      const docSnap = await getDoc(docRef);
      docSnap.exists()
        ? setLandlord(docSnap.data())
        : toast.error("Could not get landlord data");
      setLoading(false);
    };
    getLandlord();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onChange = (e) => setMessage(e.target.value);
  return (
    <>
      {loading && <Spinner />}
      <div className="ContactPage">
        <header>
          <h1>Contact Landlord</h1>
        </header>
        <main>
          <h1>Contact {landlord?.name}</h1>
          <div className="contact-form">
            <form>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={message}
                onChange={onChange}
              ></textarea>
              <button type="submit">
                <a
                  href={`mailto:${landlord?.email}?Subject=${searchParams.get(
                    "listingName"
                  )}&body=${message}`}
                >
                  Send Email
                </a>
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default ContactPage;
