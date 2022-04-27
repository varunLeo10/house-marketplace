import { useNavigate, useParams } from "react-router-dom";
import { ReactComponent as DeleteIcon } from "../../assets/svg/deleteIcon.svg";
import { ReactComponent as EditIcon } from "../../assets/svg/editIcon.svg";
import bathIcon from "../../assets/svg/bathtubIcon.svg";
import bedIcon from "../../assets/svg/bedIcon.svg";
function ListingItem({ listing, deletion, edit }) {
  const navigate = useNavigate();
  const params = useParams();
  const handleClick = (e) => {
    console.log(e.target);
    if (e.target.closest(".editIcon")) {
      navigate(`/edit-listing/${listing.id}`);
      return;
    }
    if (e.target.closest(".deleteIcon")) {
      deletion(listing.id);
      return;
    }
    if (e.target.closest(".listItem")) {
      navigate(`/category/${params.categoryName}/${listing.id}`);
      return;
    }
  };
  return (
    <li className="listItem" onClick={handleClick}>
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
      {deletion && (
        <div className="deleteIcon">
          <DeleteIcon fill="rgb(231,76,60)" />
        </div>
      )}
      {edit && (
        <div className="editIcon">
          <EditIcon fill="#2c2c2c" />
        </div>
      )}
    </li>
  );
}

export default ListingItem;
