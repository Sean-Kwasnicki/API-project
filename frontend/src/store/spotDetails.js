import { csrfFetch } from "./csrf";

// Action type

const GET_SPOT_DETAILS = 'spots/GET_SPOT_DETAILS';

// Action Creator
const getSpotID = (spotDetails) => {
  return {
    type: GET_SPOT_DETAILS,
    payload: spotDetails,
  };
};

// Thunk action Creator for spot details
export const getSpotDetails = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}`);

  if(response.ok) {
    const spotDetails = await response.json();
    dispatch(getSpotID(spotDetails));
    return spotDetails
  }
};

// Initial State

const initialState = {};

// SpotDetails Reducer

const spotDetailsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SPOT_DETAILS:
      return {
        ...state,
        [action.payload.id]: action.payload
      };
    default:
      return state;
  }
};



export default spotDetailsReducer;
