import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import Spinner from "../../components/Spinner";
import closeIcon from "../../assets/jpg/close.png";
import "./CreateListing.css";
import { toast } from "react-toastify";
function EditListing() {
  const API_KEY = process.env.REACT_APP_API_KEY;
  const today = useRef(null);
  const mounted = useRef(true);
  const [loading, setLoading] = useState(true);
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
  const [updatedForm, setUpdatedForm] = useState({});
  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();
  useEffect(() => {
    if (mounted) {
      const now = new Date();
      let dd = now.getDate();
      let mm = now.getMonth() + 1;
      let yyyy = now.getFullYear();
      if (dd < 10) dd = "0" + dd;
      if (mm < 10) mm = "0" + mm;
      today.current = `${dd}${mm}${yyyy}`;
      getDocument();
      setLoading(false);
    }
    async function getDocument() {
      const docSnap = await getDoc(doc(db, "listings", `${params.listingId}`));
      const form = {
        ...docSnap.data(),
      };
      const {
        fileList: images,
        geolocation: { lat: latitude, lng: longitude },
        location: address,
        imgUrls: imageUrls,
      } = form;
      form.images = images;
      form.latitude = latitude;
      form.longitude = longitude;
      form.address = address;
      form.imageUrls = imageUrls;
      delete form.imgUrls;
      delete form.geolocation;
      delete form.location;
      if (form.offer === false) {
        form.discountedPrice = 1;
      }
      setFormData(form);
    }
    return () => (mounted.current = false);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);
  const onSubmit = async (e) => {
    if (Object.keys(updatedForm).length === 0) {
      navigate("/profile");
      return;
    }
    if (formData.images.length === 0) {
      toast.error("Please upload image");
      return;
    }
    try {
      setLoading(true);
      e.preventDefault();
      let lat;
      let lng;
      let location;
      if (updatedForm.hasOwnProperty("address")) {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${formData.address}&key=${API_KEY}`
        );
        const data = await res.json();
        if (data.status === "ZERO_RESULTS") {
          toast.error("Please enter a correct address");
          setLoading(false);
          return;
        } else {
          lat = data.results[0].geometry.location.lat ?? 0;
          lng = data.results[0].geometry.location.lng ?? 0;
          location = formData.address;
        }
      }
      let imgUrls;
      let fileArr;
      let fileLists;
      let fileList;
      if (updatedForm.hasOwnProperty("images")) {
        if (formData.fileList === null) {
          imgUrls = await Promise.all(
            formData.images.map((file) => fileUpload(file[0]))
          );
          fileArr = formData.images.map((file) => {
            return {
              name: file[0].name,
              lastModified: file[0].lastModified,
              lastModifiedDate: file[0].lastModifiedDate,
              size: file[0].size,
              type: file[0].type,
              webkitRelativePath: file[0].webkitRelativePath,
            };
          });
          fileList = fileArr.map((file) => {
            return { 0: file, length: 1 };
          });
        } else {
          let newImages = [];
          formData.images.forEach((file) => {
            let found = 0;
            for (let i = 0; i < formData.fileList.length; i++) {
              if (formData.fileList[i][0].name === file[0].name) {
                found = 1;
                break;
              }
            }
            if (found === 0) {
              newImages.push(file);
            }
          });
          const urls = await Promise.all(
            newImages.map((file) => fileUpload(file[0]))
          );
          imgUrls = [...formData.imageUrls, ...urls];
          fileArr = newImages.map((file) => {
            return {
              name: file[0].name,
              lastModified: file[0].lastModified,
              lastModifiedDate: file[0].lastModifiedDate,
              size: file[0].size,
              type: file[0].type,
              webkitRelativePath: file[0].webkitRelativePath,
            };
          });
          fileLists = fileArr.map((file) => {
            return { 0: file, length: 1 };
          });
          fileList = [...formData.fileList, ...fileLists];
        }
      }
      const uploadData = {
        ...updatedForm,
        timestamp: serverTimestamp(),
        geolocation: { lat, lng },
        imgUrls,
        location,
        fileList,
      };
      delete uploadData.address;
      delete uploadData.images;
      delete uploadData.longitude;
      delete uploadData.latitude;
      if (uploadData.hasOwnProperty("offer")) {
        uploadData.offer
          ? (uploadData.discountedPrice = formData.discountedPrice)
          : delete uploadData.discountedPrice;
        !uploadData.offer &&
          (await updateDoc(doc(db, "listings", `${params.listingId}`), {
            discountedPrice: deleteField(),
          }));
      }
      if (location === undefined) {
        delete uploadData.geolocation;
        delete uploadData.location;
      }
      if (imgUrls === undefined) {
        delete uploadData.imgUrls;
        delete uploadData.fileList;
      }
      await updateDoc(doc(db, "listings", `${params.listingId}`), uploadData);
      setLoading(false);
      toast.success("Listing successfully updated!");
      navigate(`/category/${uploadData.type}/${params.listingId}`);
    } catch (error) {
      setLoading(false);
      toast(error);
      return;
    }
  };
  const fileUpload = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const fileName = `${auth.currentUser.uid}-${today.current}-${file.name}`;
      const storageRef = ref(storage, `images/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          reject("File Upload failed Please limit file size to 10MB");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
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
    setUpdatedForm({ ...updatedForm, [key]: value });
    setFormData({ ...formData, [key]: value });
  };
  const deleteFile = (fileName) => {
    const arr = formData.images;
    const newArr = arr.filter((image) => {
      return image[0].name !== fileName;
    });
    let ind;
    let newFileList;
    let newImageArr;
    if (formData.fileList !== null) {
      if (formData.fileList.length === 1) {
        setFormData({
          ...formData,
          images: newArr,
          fileList: null,
          imageUrls: null,
        });
        setUpdatedForm({ ...updatedForm, images: newArr });
      } else {
        newFileList = formData.fileList.filter((file, index) => {
          if (file[0].name === fileName) {
            ind = index;
          }
          return file[0].name !== fileName;
        });
        newImageArr = formData.imageUrls.filter(
          (image, index) => index !== ind
        );
        setFormData({
          ...formData,
          images: newArr,
          fileList: newFileList,
          imageUrls: newImageArr,
        });
        setUpdatedForm({ ...updatedForm, images: newArr });
      }
    } else {
      setFormData({ ...formData, images: newArr });
      setUpdatedForm({ ...updatedForm, images: newArr });
    }
  };
  const onMutate = (e) => {
    if (e.target.id === "images") {
      if (e.target.files.length > 0) {
        if (formData.images.length === 6) {
          toast.error("Maximum six images allowed");
          return;
        }
        const arr = formData.images;
        const found = arr.find((el) => el[0].name === e.target.files[0].name);
        if (!found) {
          arr.push(e.target.files);
          changeState(e.target.id, arr);
        }
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
          <h1>Edit Listing</h1>
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
                {formData.type === "rent" ? (
                  <p>&#8377;/Month</p>
                ) : (
                  <p>&#8377;</p>
                )}
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
                  {formData.type === "rent" ? (
                  <p>&#8377;/Month</p>
                ) : (
                  <p>&#8377;</p>
                )}
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
                />

                {formData.images.length > 0 ? (
                  <div className="file-names">
                    {formData.images.map((image) => (
                      <div key={image[0].name}>
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
              Edit Listing
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
export default EditListing;
