// Import
import { useState } from 'react';
import './CreateNewSpot.css';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSpot } from '../../store/spot';

function CreateNewSpot() {
  // State for each input field
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [imageURLs, setImageURLs] = useState(["", "", "", ""]);
  const [lng, setLongitude] = useState("");
  const [lat, setLatitude] = useState("");

  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate()


  // Function to check if form is valid
  // const isFormValid = () => {
  //   return (
  //     country.trim() && street.trim() && city.trim() && state.trim() &&
  //     description.length >= 30 && title.trim() && price.trim() &&
  //     previewImage.trim() && imageURLs.every(url => url.trim())
  //   );
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!country) newErrors.country = 'Country is required';
    if (!address) newErrors.address = 'Street address is required';
    if (!city) newErrors.city = 'City is required';
    if (!state) newErrors.state = 'State is required';
    if (!description) newErrors.description = 'Description is required';
    if (description.length < 30) newErrors.description = 'Description must be at least 30 characters';
    if (!name) newErrors.name = 'Name is required';
    if (!price) newErrors.price = 'Price is required';
    if (!previewImage) newErrors.previewImage = 'Preview image is required';
    if (!imageURLs === 0) newErrors.imageURLs = 'Image URL must end in .png .jpg or .jpeg';
    if (!lng) newErrors.longitude = 'Longitude is required';
    if (!lat) newErrors.latitude = 'Latitude is required';

    setErrors(newErrors);

    if (Object.keys(errors).length === 0) {
      const spotDetails = {
        country,
        address,
        city,
        state,
        description,
        name,
        price,
        previewImage,
        images: imageURLs,
        lat,
        lng
    };
      const createdSpot = await dispatch(createSpot(spotDetails));


    // Navigate to the spot details page using the spot ID
      //if (createdSpot) {
        navigate(`/spots/${createdSpot.id}`);
      //}
    }
  };

  return (
    <form className="create-new-spot-form" onSubmit={handleSubmit} noValidate>
      <h1>Create a New Spot</h1>

      {/* Location Section */}
      <div className="form-section">
        <h2>Where is your place located?</h2>
        <p>Guests will only get your exact address once they have booked a reservation.</p>

        <div className="form-field-inline">
        <label className="label-create-new">Country</label>
        {errors.country && <div className="error-message-inline">{errors.country}</div>}
         </div>
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />

        <div className="form-field-inline">
        <label className="label-create-new">Street Address</label>
        {errors.address && <div className="error-message-inline">{errors.address}</div>}
         </div>
        <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
        />
        </div>

        {/* City/State Section */}
        <div className="address-container">
            <label className="label-create-new" id="text">
                City
                {errors.city && <div className="error-message-inline">{errors.city}</div>}
            </label>

            <label className="label-create-new" id="StateText"></label>
                <div></div>

            <label className="label-create-new" id="text">
                State
                {errors.state && <div className="error-message-inline">{errors.state}</div>}
            </label>

            <input
                type="text"
                placeholder="City"
                value={city}
                id="City"
                onChange={(e) => setCity(e.target.value)}
                required
                className="form-input"
            />

            <div className="input-with-comma">,</div>

            <input
                type="text"
                placeholder="State"
                value={state}
                id="State"
                onChange={(e) => setState(e.target.value)}
                required
                className="form-input"
            />
        </div>

        {/* Lat/Lng Section */}
        <div className="lng-lat-container">
            <label className="label-create-new" id="text">
                Longitude
                {errors.longitude && <div className="error-message-inline">{errors.longitude}</div>}
            </label>
            <label className="label-create-new" id="StateText"></label>
            <div></div>
            <label className="label-create-new" id="text">
                Latitude
                {errors.latitude && <div className="error-message-inline">{errors.latitude}</div>}
            </label>

            <input
                type="number"
                placeholder="Longitude"
                value={lng}
                onChange={(e) => setLongitude(e.target.value)}
                required
                className="form-input"
            />

            <div className="input-with-comma">,</div>

            <input
                type="number"
                placeholder="Latitude"
                value={lat}
                onChange={(e) => setLatitude(e.target.value)}
                required
                className="form-input"
            />
        </div>


      {/* Description Section */}
      <div className="form-section">
        <h2>Describe your place to guests</h2>
        <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
        <textarea
          placeholder="Please write at least 30 characters"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
         {errors.description && <div className="error-message-inline">{errors.description}</div>}
      </div>

      {/* Title Section */}
      <div className="form-section">
        <h2>Create a title for your spot</h2>
        <p>Catch guests attention with a spot title that highlights what makes your place special.</p>
        <input
          type="text"
          placeholder="Name of your spot"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
         {errors.name && <div className="error-message-inline">{errors.name}</div>}
      </div>

      {/* Price Section */}
      <div className="form-section">
        <h2>Set a base price for your spot</h2>
        <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
        <input
          type="number"
          placeholder="Price per night (USD)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
         {errors.price && <div className="error-message-inline">{errors.price}</div>}
      </div>

      {/* Photos Section */}
      <div className="form-section">
        <h2>Liven up your spot with photos</h2>
        <p>Submit a link to at least one photo to publish your spot.</p>
        <input
          type="text"
          placeholder="Preview Image URL"
          value={previewImage}
          onChange={(e) => setPreviewImage(e.target.value)}
          required
        />
         {errors.previewImage && <div className="error-message-inline">{errors.previewImage}</div>}
        {imageURLs.map((url, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Image URL ${index + 1}`}
            value={url}
            onChange={(e) => {
              const newImageURLs = [...imageURLs];
              newImageURLs[index] = e.target.value;
              setImageURLs(newImageURLs);
            }}
            required={index === 0}
          />
            
        ))}
      </div>
      {errors.imageURLs && <div className="error-message-inline">{errors.imageURLs}</div>}
      <button className="create-button" type="submit" >Create Spot</button>
    </form>
  );
}

export default CreateNewSpot;
