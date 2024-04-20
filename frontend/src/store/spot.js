import { csrfFetch } from "./csrf";

// Action type
const ADD_SPOT = 'spots/ADD_SPOT';
const GET_ALL_SPOTS = 'spots/GET_ALL_SPOTS';
const GET_USER_SPOTS = 'spots/GET_USER_SPOTS';
const DELETE_SPOT = 'spots/DELETE_SPOT';
const UPDATE_SPOT = 'spots/UPDATE_SPOT';
const GET_SPOT_DETAILS = 'spots/GET_SPOT_DETAILS';

// Action Creator
const addSpot = (spot) => {
    return {
        type: ADD_SPOT,
        payload: spot,
    };
};

const getSpots = (spots) => ({
    type: GET_ALL_SPOTS,
    payload: spots,
});

export const getUserSpots = (spots) => ({
    type: GET_USER_SPOTS,
    payload: spots,
  });

export const removeSpot = (spotId) => ({
    type: DELETE_SPOT,
    payload: spotId
});


export const editSpot = (spot) => ({
    type: UPDATE_SPOT,
    payload: spot
});

// Action Creator
const getSpotID = (spotDetails) => {
    return {
      type: GET_SPOT_DETAILS,
      payload: spotDetails,
    };
  };

  const getSpotDetailsSuccess = (spotDetails) => ({
    type: GET_SPOT_DETAILS,
    payload: spotDetails,
  });


// Action Creator for updating a spot
export const updateSpotAction = (spot) => ({
    type: UPDATE_SPOT,
    payload: spot
});

export const SpotDetails = (spotId) => async (dispatch) => {
    try {
      const response = await csrfFetch(`/api/spots/${spotId}`);
      if (response.ok) {
        const spotDetails = await response.json();
        dispatch(getSpotDetailsSuccess(spotDetails));
      }
    } catch (error) {
      console.error('Failed to fetch spot details:', error);
    }
  };


export const updateSpot = (spotDetails, spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(spotDetails)
    });

    if (response.ok) {
        const updatedSpot = await response.json();
        dispatch(updateSpotAction(updatedSpot));
        return updatedSpot;
    } else {
        throw new Error('Failed to update the spot');
    }
};


// Thunk Action Creator for creating a new spot
export const createSpot = (spotDetails) => async (dispatch) => {
    const response = await csrfFetch('/api/spots', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(spotDetails),
    });

    if(response.ok) {
        let spot = await response.json();

        // Upload images, if there are any
        if (spotDetails.images && spotDetails.images.length > 0) {
            await Promise.all(spotDetails.images.map(async (url, index) => {
                if (url.trim() !== "") {
                    const imageResponse = await csrfFetch(`/api/spots/${spot.id}/images`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ url, preview: index === 0 })
                    });
                    if (imageResponse.ok) {
                        const imageData = await imageResponse.json();
                        spot.SpotImages = spot.SpotImages || [];
                        spot.SpotImages.push(imageData);
                    }
                }
            }));
        }
        dispatch(addSpot(spot));
        return spot;
    } else {
        console.error('Failed to create spot:', await response.json());
        throw new Error('Failed to create spot');
    }
};

export const getAllSpots = () => async (dispatch) => {
    const response = await csrfFetch('/api/spots');
    if (response.ok) {
        const data = await response.json();
        dispatch(getSpots(data.Spots));

        // Fetch details for each spot
        data.Spots.forEach(spot => {
            dispatch(SpotDetails(spot.id));
        });
    }
};


export const currentUserSpots = () => async (dispatch) => {
    try {
      const response = await csrfFetch('/api/spots/current');
      const { Spots } = await response.json();
      dispatch(getUserSpots(Spots));
    } catch (error) {
      console.error('Failed to fetch spots:', error);
    }
};

export const deleteSpot = (spotId) => async (dispatch) => {
    try {
      const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        dispatch(removeSpot(spotId));
      }
    } catch (error) {
      console.error('Failed to delete spot:', error);
    }
};

// Initial State

const initialState = {};

// Spot Reducer

const spotReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_ALL_SPOTS:
            return {
                ...state,
                ...action.payload.reduce((acc, spot) => {
                    acc[spot.id] = {
                        ...spot,
                        SpotImages: spot.SpotImages || []
                    };
                    return acc;
                }, {})
            };
        case GET_SPOT_DETAILS:
            // Merge details into existing spot data if needed
            if (state[action.payload.id]) {
                return {
                    ...state,
                    [action.payload.id]: {
                        ...state[action.payload.id],
                        ...action.payload,
                        SpotImages: action.payload.SpotImages || state[action.payload.id].SpotImages
                    }
                };
            }
                return {
                    ...state,
                    [action.payload.id]: action.payload
                };
        case ADD_SPOT:
            return {
                ...state,
                [action.payload.id]: {
                    ...action.payload,
                    SpotImages: action.payload.SpotImages || []
                }
            };
        case DELETE_SPOT:
            const newState = { ...state };
            delete newState[action.payload];
            return newState;
        case GET_USER_SPOTS:
            return {
                ...state,
                ...action.payload.reduce((acc, spot) => {
                    acc[spot.id] = spot;
                    return acc;
                }, {})
            };
        case UPDATE_SPOT:
            return {
                ...state,
                [action.payload.id]: {
                ...state[action.payload.id],
                ...action.payload,
                SpotImages: action.payload.SpotImages || state[action.payload.id]?.SpotImages || []
            }
    };
        default:
            return state;
    }
};

export default spotReducer;
