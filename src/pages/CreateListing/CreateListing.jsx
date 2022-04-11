import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Spinner from "../../components/Spinner";
import closeIcon from "../../assets/jpg/close.png";
import "./CreateListing.css";
import { toast } from "react-toastify";
function CreateListing() {
  const mounted = useRef(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    offer: false,
    regularPrice: 50,
    discountedPrice: 1,
    images: [],
    latitude: 0,
    longitude: 0,
  });
  const auth = getAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (mounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
          setLoading(false);
        } else {
          navigate("/sign-in");
        }
      });
    }
    return () => (mounted.current = false);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);
  const onSubmit = (e) => {
    e.preventDefault();
    formData.offer === false &&
      setFormData({ ...formData, discountedPrice: 0 });
  };
  const changeState = (key, value) => {
    if (key === "parking" || key === "furnished" || key === "offer") {
      value === "true" ? (value = true) : (value = false);
    }
    if (
      key === "bedrooms" ||
      key === "bathrooms" ||
      key === "regularPrice" ||
      key === "discountedPrice" ||
      key === "latitude" ||
      key === "longitude"
    ) {
      value = Number(value);
      if (
        (key === "bedrooms" || key === "bathrooms") &&
        (value > 50 || value < 1)
      ) {
        toast.error("Minimum should be 1 and maximum should be 50");
      }
      if (key === "regularPrice" && (value > 750000000 || value < 50)) {
        toast.error("Minimum should be 50 and maximum should be 750000000");
        return;
      }
      if (key === "discountedPrice" && value < 1) {
        toast.error("Value should be greater than zero");
        return;
      }
      if (key === "discountedPrice" && value >= formData.regularPrice) {
        toast.error(
          "Discounted price cannot be greater or equal to Regular Price"
        );
        return;
      }
    }
    setFormData({ ...formData, [key]: value });
  };
  const deleteFile = (fileName) => {
    const arr = formData.images;
    const newArr = arr.filter((image) => {
      return image[0].name !== fileName;
    });
    setFormData({ ...formData, images: newArr });
  };
  const onMutate = (e) => {
    if (e.target.id === "images") {
      if (e.target.files.length > 0) {
        const arr = formData.images;
        arr.push(e.target.files);
        changeState(e.target.id, arr);
      }
    } else {
      changeState(e.target.id, e.target.value);
    }
  };
  return (
    <>
      {loading && <Spinner />}
      <div className="create-list-form">
        <header>
          <h1>Create Listing</h1>
        </header>
        <main>
          <form onSubmit={onSubmit}>
            <FormYNbtn
              classname="sell-rent-button"
              label="Sell/Rent"
              data={formData.type === "sale"}
              value1="sale"
              value2="rent"
              text1="Sale"
              text2="Rent"
              idname="type"
              onMutate={onMutate}
            />
            <div className="form-name">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={onMutate}
                id="name"
                maxLength={32}
                minLength={10}
                required
              />
            </div>
            <div className="form-bed-bath">
              <div className="form-bed">
                <label>Bedrooms</label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={onMutate}
                  id="bedrooms"
                  min={1}
                  max={50}
                />
              </div>
              <div className="form-bath">
                <label>Bathrooms</label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={onMutate}
                  id="bathrooms"
                  min={1}
                  max={50}
                />
              </div>
            </div>
            <FormYNbtn
              classname="parking-sp"
              label="Parking Spot"
              data={formData.parking}
              idname="parking"
              onMutate={onMutate}
            />
            <FormYNbtn
              classname="form-furnished"
              label="Furnished"
              data={formData.furnished}
              idname="furnished"
              onMutate={onMutate}
            />
            <div className="form-address">
              <label>Address:</label>
              <textarea
                type="text"
                id="address"
                value={formData.address}
                onChange={onMutate}
                required
              ></textarea>
            </div>
            <FormYNbtn
              classname="form-offer"
              label="Offer"
              data={formData.offer}
              idname="offer"
              onMutate={onMutate}
            />
            <div className="form-reg-price">
              <label>Regular Price</label>
              <div>
                <input
                  type="number"
                  value={formData.regularPrice}
                  id="regularPrice"
                  onChange={onMutate}
                  min={50}
                  max={750000000}
                />
                {formData.type === "rent" && <p>$/Month</p>}
              </div>
            </div>
            {formData.offer && (
              <div className="form-disc-price">
                <label>Discounted Price</label>
                <div>
                  <input
                    type="number"
                    value={formData.discountedPrice}
                    id="discountedPrice"
                    onChange={onMutate}
                    min={1}
                    max={750000000}
                  />
                  <p>$</p>
                </div>
              </div>
            )}
            <div className="form-img-up">
              <label>Images</label>
              <p>The first Image will be the cover{` [max 6]`}</p>
              <div
                className="img-inp"
                style={formData.images.length === 0 ? style : {}}
              >
                <input
                  type="file"
                  id="images"
                  onChange={onMutate}
                  max="6"
                  accept=".jpg,.png,.jpeg"
                  multiple
                  required
                />

                {formData.images.length > 0 ? (
                  <div className="file-names">
                    {formData.images.map((image) => (
                      <div>
                        <p>{image[0].name}</p>
                        <img
                          src={closeIcon}
                          alt="delete file"
                          onClick={() => deleteFile(image[0].name)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>No files to show</span>
                )}
              </div>
            </div>
            <button className="crlist-submit-btn" type="submit">
              Create Listing
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
const style = {
  display: "flex",
  alignItems: "center",
  flexDirection: "row",
};
function FormYNbtn({
  classname,
  label,
  data,
  idname,
  value1 = true,
  value2 = false,
  onMutate,
  text1,
  text2,
}) {
  return (
    <div className={classname}>
      <label>{label}</label>
      <button
        type="button"
        className={data ? "active-btn" : "non-active-btn"}
        value={value1}
        id={idname}
        onClick={onMutate}
      >
        {text1}
      </button>
      <button
        type="button"
        value={value2}
        id={idname}
        className={!data ? "active-btn" : "non-active-btn"}
        onClick={onMutate}
      >
        {text2}
      </button>
    </div>
  );
}
FormYNbtn.propTypes = {
  classname: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  data: PropTypes.bool.isRequired,
  value1: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  value2: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  text1: PropTypes.string,
  text2: PropTypes.string,
  onMutate: PropTypes.func.isRequired,
};
FormYNbtn.defaultProps = {
  value1: true,
  value2: false,
  text1: "Yes",
  text2: "No",
};
export default CreateListing;
