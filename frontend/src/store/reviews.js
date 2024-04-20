import { csrfFetch } from "./csrf";
import { getAllSpots } from "./spot";

// Action Type
const GET_ALL_REVIEWS = 'reviews/GET_ALL_REVIEWS'
const ADD_REVIEW = 'spot/ADD_REVIEW'
const DELETE_REVIEW = 'reviews/DELETE_REVIEW';

// Action Creator
const getReviews = (reviews, spotId) => {
return {
  type: GET_ALL_REVIEWS,
  payload: reviews,
  spotId
  };
};

const addReview = (review) => ({
  type: ADD_REVIEW,
  payload: review,
});

// Action Creator
const deleteReviewAction = (reviewId) => ({
  type: DELETE_REVIEW,
  payload: reviewId,
});

// Thunk Action Creator

export const getAllReviews = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
  if(response.ok) {
    const data = await response.json();
    dispatch(getReviews(data.Reviews, spotId));
  }
};

export const createReview = (spotId, reviewData) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });
  if (response) {
    const review = await response.json();
    dispatch(addReview(review, spotId));
    dispatch(getAllSpots());
    return true;
  }
  return false;
};

// Thunk Action
export const deleteReview = (reviews) => async (dispatch) => {
  try {
      const response = await csrfFetch(`/api/reviews/${reviews.id}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json'
          }
      });
      if (response.ok) {
          dispatch(deleteReviewAction(reviews.id));
      } else {
          const errorData = await response.json();
          throw new Error(errorData.message);
      }
  } catch (error) {
      console.error('Failed to delete review:', error);
      alert(error.message);
  }
};


// Initial State

const initialState = {};

const reviewsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ALL_REVIEWS:
      return { ...state, [action.spotId]: action.payload };
    case ADD_REVIEW:
      return {
        ...state,
        [action.payload.spotId]: [action.payload, ...state[action.payload.spotId]]
      };
    case DELETE_REVIEW:
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    default:
      return state;
  }
};

export default reviewsReducer;
