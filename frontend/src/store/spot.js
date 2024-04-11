import { csrfFetch } from "./csrf";

// Action type
const ADD_SPOT = 'spots/ADD_SPOT';

// Action Creator
const addSpot = (spot) => {
    return {
        type: ADD_SPOT,
        payload: spot,
    };
};

// Thunk Action Creator for creating a new spot
export const createSpot = (spotDetails) => async (dispatch) => {
    const response = await csrfFetch('/api/spots/new', {
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

// Initial State

const initialState = {};

// Spot Reducer

const spotReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_SPOT:
            return { ...state, [action.payload.id]: action.payload };
            default:
                return state;
    }
};

export default spotReducer;