// Import React and useState hook
import { useState } from 'react';
import './CreateNewSpot.css';

function CreateNewSpot() {
  // State for each input field
  const [country, setCountry] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [imageURLs, setImageURLs] = useState(["", "", "", ""]); // Assuming 4 additional images

  const [errors, setErrors] = useState({});

  // Function to check if form is valid
  const isFormValid = () => {
    return (
      country.trim() && street.trim() && city.trim() && state.trim() &&
      description.length >= 30 && title.trim() && price.trim() &&
      previewImage.trim() && imageURLs.every(url => url.trim())
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!country) newErrors.country = 'Country is required';
    if (!street) newErrors.street = 'Street address is required';
    if (!city) newErrors.city = 'City is required';
    if (!state) newErrors.state = 'State is required';
    if (!description) newErrors.description = 'Description is required';
    if (description.length < 30) newErrors.description = 'Description must be at least 30 characters';
    if (!title) newErrors.title = 'Title is required';
    if (!price) newErrors.price = 'Price is required';
    if (!previewImage) newErrors.previewImage = 'Preview image is required';

    setErrors(newErrors);
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

        <input
          type="text"
          placeholder="Street Address"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
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
      </div>

      {/* Title Section */}
      <div className="form-section">
        <h2>Create a title for your spot</h2>
        <p>Catch guests attention with a spot title that highlights what makes your place special.</p>
        <input
          type="text"
          placeholder="Name of your spot"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
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
            required={index === 0} // Only the first image URL is required
          />
        ))}
      </div>

      <button className="create-button" type="submit" >Create Spot</button>
    </form>
  );
}

export default CreateNewSpot;
