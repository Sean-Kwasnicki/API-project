import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getAllReviews } from '../../store/reviews';

function Reviews({ spot }) {
    const dispatch = useDispatch();
    const { spotId } = useParams();
    const reviews = useSelector(state => state.reviews[spotId] || []); // Ensure it defaults to an empty array if undefined
    const sessionUser = useSelector(state => state.session.user);
    const spotDetails = useSelector(state => state.spotDetails[spotId]);

    useEffect(() => {
        dispatch(getAllReviews(spotId)); // Fetch reviews when component mounts
    }, [dispatch, spotId]);

  //    Lets check what's in your reviews state
  //    useEffect(() => {
  //    console.log("Reviews:", reviews);
  // }, [reviews]);

  if (!reviews.length) {
    if (sessionUser && sessionUser.id !== spotDetails.ownerId) {
        return <p>Be the first to post a review!</p>;
    }
    return <p>No reviews yet.</p>; // This text shows if no reviews and user is the owner or not logged in
}


    return (
        <div>
            <h3>Reviews</h3>
            {reviews.map(review => (
                <div key={review.id}>
                    <p className='created'>{review.User.firstName} - {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                    <p>{review.review}</p>
                    {/* <p>2 - {review.id}</p>
                    <p>3- {review.userId}</p>
                    <p> {spotDetails.ownerId} -{spotDetails.Owner.firstName}</p> */}
                </div>
            ))}
        </div>
    );
}

export default Reviews;
