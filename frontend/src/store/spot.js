import { csrfFetch } from "./csrf";

// Action type
const ADD_SPOT = 'spots/ADD_SPOT';
const GET_ALL_SPOTS = 'spots/GET_ALL_SPOTS';

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
        const spot = await response.json();
        dispatch(addSpot(spot));
        return spot;
    }
};

// Thunk Action Creator for fetching all spots
export const getAllSpots = () => async(dispatch) => {
    const response = await csrfFetch('/api/spots');
    if(response.ok) {
        const data = await response.json();
        dispatch(getSpots(data.Spots));
        return data;
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
                ...action.payload.reduce((acc,spot) => {
                    acc[spot.id] = spot;
                    return acc;
                }, {})
            };
        case ADD_SPOT:
            return { ...state, 
                [action.payload.id]: action.payload 
            };
        default:
            return state;
    }
};

export default spotReducer;
