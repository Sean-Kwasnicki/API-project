import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateSpot } from '../../store/spot';
import { getSpotDetails } from '../../store/spotDetails';
import { getAllSpots } from '../../store/spot';


function UpdateSpotForm() {
    const { spotId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const spot = useSelector(state => state.spotDetails[spotId]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        if (spot) {
            setName(spot.name);
            setDescription(spot.description);
            setPrice(spot.price);
            setAddress(spot.address);
            setCity(spot.city);
            setState(spot.state);
            setCountry(spot.country);
            setLat(spot.lat);
            setLng(spot.lng);
        } else {
            dispatch(getSpotDetails(spotId));
            dispatch(getAllSpots(spotId));
        }
    }, [dispatch, spotId, spot]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const spotDetails = {
            name, description, price, address, city, state, country, lat, lng
        };
        try {
            const updated = await dispatch(updateSpot(spotDetails, spotId));
            if (updated) {
              dispatch(getAllSpots(spotId));  
                navigate(`/spots/${spotId}`);
            }
        } catch (error) {
            console.error('Failed to update the spot:', error);
            setError('Failed to update the spot. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="update-spot-form">
            <h1>Update Your Spot</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input id="name" value={name} onChange={e => setName(e.target.value)} required />

                <label htmlFor="description">Description</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required />

                <label htmlFor="price">Price</label>
                <input type="number" id="price" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required />

                <label htmlFor="address">Address</label>
                <input id="address" value={address} onChange={e => setAddress(e.target.value)} required />

                <label htmlFor="city">City</label>
                <input id="city" value={city} onChange={e => setCity(e.target.value)} required />

                <label htmlFor="state">State</label>
                <input id="state" value={state} onChange={e => setState(e.target.value)} required />

                <label htmlFor="country">Country</label>
                <input id="country" value={country} onChange={e => setCountry(e.target.value)} required />

                <label htmlFor="lat">Latitude</label>
                <input type="number" id="lat" value={lat} onChange={e => setLat(parseFloat(e.target.value))} required />

                <label htmlFor="lng">Longitude</label>
                <input type="number" id="lng" value={lng} onChange={e => setLng(parseFloat(e.target.value))} required />
            </div>
            <button type="submit">Update Your Spot</button>
        </form>
    );
}

export default UpdateSpotForm;
