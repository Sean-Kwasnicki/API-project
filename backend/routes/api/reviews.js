const express = require('express');
const { Review, Spot, User, ReviewImage, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check} = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Validation middleware for Valid Review
const validateReview = [
  check('review')
    .notEmpty()
    .withMessage('Review text is required'),
  check('stars')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors
];

// Get the reivew of the current user
router.get('/current', requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    const reviews = await Review.findAll({
      where: { userId: userId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Spot,
          attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
          include: [{
            // Need the SpotsImage to be previewImage and have the image url need to sue teh helper function I built in spots 
            model: SpotImage,
            attributes: ['url'],
            where: { preview: true },
            required: false
          }]
        },
        {
          model: ReviewImage,
          as: 'ReviewImages',
          attributes: ['id', 'url']
        }
      ]
    });
    res.json({ Reviews: reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add an image to the reivews ID
router.post('/:reviewId/images', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url, preview } = req.body;
  const userId = req.user.id;

  try {
    // Validate the review belongs to the current user
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }
    if (review.userId !== userId) {
      return res.status(403).json({ message: "Forbidden. You do not own this review." });
    }

    // Check for maximum number of images
    const imagesCount = await ReviewImage.count({ where: { reviewId } });
    if (imagesCount >= 10) {
      return res.status(403).json({ message: "Maximum number of images for this resource was reached" });
    }

    // Add the image to the review
    const newImage = await ReviewImage.create({
      reviewId,
      url,
      preview,
    });

    // Respond with only the 'id' and 'url' of the new image
    return res.status(200).json({
      id: newImage.id,
      url: newImage.url
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while adding the image." });
  }
});

// Route to edit a review
router.put('/:reviewId', requireAuth, validateReview, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  try {
    // Find the review by ID and make sure it belongs to the current user
    const existingReview = await Review.findByPk(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }
    if (existingReview.userId !== userId) {
      return res.status(403).json({ message: "Forbidden. You do not own this review." });
    }

    // Update the review
    await Review.update(
      { review, stars },
      { where: { id: reviewId, userId } }
    );

    // Fetch the updated review to return
    const updatedReview = await Review.findByPk(reviewId);

    // Return the updated review
    return res.json({
      id: updatedReview.id,
      userId: updatedReview.userId,
      spotId: updatedReview.spotId,
      review: updatedReview.review,
      stars: updatedReview.stars,
      createdAt: updatedReview.createdAt,
      updatedAt: updatedReview.updatedAt
    });
  } catch (error) {
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

// Route to delete a review
router.delete('/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ message: "Forbidden. You do not own this review." });
    }

    // Delete the review
    await review.destroy();

    // Return success message
    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

module.exports = router;
