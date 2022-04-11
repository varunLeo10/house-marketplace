import { Link, useParams } from "react-router-dom";
import { ReactComponent as DeleteIcon } from "../../assets/svg/deleteIcon.svg";
import bathIcon from "../../assets/svg/bathtubIcon.svg";
import bedIcon from "../../assets/svg/bedIcon.svg";
function ListingItem({ listing, onDelete }) {
  const params = useParams();
  return (
    <li>
      <Link
        className="listItem"
        to={`/category/${params.categoryName}/${listing.id}`}
      >
        <img
          className="house-img"
          src={listing.data.imageUrls[0]}
          alt={`${listing.data.name}`}
        />
        <div className="listDet">
          <p className="location">{listing.data.location}</p>
          <p className="name">{listing.data.name}</p>
          <p className="price">
            {`$ ${listing.data.regularPrice.toLocaleString()}`}
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
        {onDelete && (
          <DeleteIcon
            className="deleteIcon"
            fill="rgb(231,76,60)"
            onClick={() => onDelete(listing.id, listing.data.name)}
          />
        )}
      </Link>
    </li>
  );
}

export default ListingItem;
