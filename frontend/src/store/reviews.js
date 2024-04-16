import { csrfFetch } from "./csrf";

// Action Type
const GET_ALL_REVIEWS = 'reviews/GET_ALL_REVIEWS'
const ADD_REVIEW = 'spot/ADD_REVIEW'

// Action Creator
const getReviews = (reviews, spotId) => {
return {
  type: GET_ALL_REVIEWS,
  payload: reviews,
  spotId
  };
};

const addReview = (review) => {
  return {
    type: ADD_REVIEW,
    payload: review
  };
};

// Thunk Action Creator

export const getAllReviews = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
  if(response.ok) {
    const data = await response.json();
    dispatch(getReviews(data.Reviews, spotId));
  }
};

export const createReview = (spotId, review) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(review),
  });
  if (response.ok) {
    const review = await response.json();
    dispatch(addReview(review));
    return review;
  }
};

// Initial State

const initialState = {};

const reviewsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_REVIEWS:
      return { ...state, [action.spotId]: action.payload };
    case ADD_REVIEW:
      return {...state, [action.payload.id]: action.payload};
    default:
      return state;
  }
};

export default reviewsReducer;
