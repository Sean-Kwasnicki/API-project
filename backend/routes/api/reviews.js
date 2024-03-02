const express = require('express');
const { Review, Spot, User, ReviewImage, SpotImage } = require('../../db/models');
const { requireAuth, checkReview } = require('../../utils/auth');
const { check} = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateReview = [
  check('review')
    .notEmpty()
    .withMessage('Review text is required'),
  check('stars')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors
];

function findPreviewImage(spotImages) {
  for (const image of spotImages) {
    if (image.preview === true) {
      return image.url;
    }
  }
  return 'Currently no preview image';
}

function formatSpots(spots) {
  let processedSpots = [];

  for (const spot of spots) {
    let spotJSON = spot.toJSON();

    spotJSON.previewImage = findPreviewImage(spotJSON.SpotImages);

    delete spotJSON.SpotImages;
    delete spotJSON.Reviews;

    processedSpots.push(spotJSON);
  }

  return processedSpots;
}

// Get all Reviews of the Current User
router.get('/current', requireAuth, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Spot,
          attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
          include: [{
            model: SpotImage,
            attributes: ['url', 'preview']
          }]
        },
        {
          model: ReviewImage,
          as: 'ReviewImages',
          attributes: ['id', 'url']
        }
      ]
    });

     let formattedReviews = reviews.map(review => {
      const reviewJSON = review.toJSON();

      if (reviewJSON.Spot) {
        reviewJSON.Spot = formatSpots([reviewJSON.Spot]);
      }

      return reviewJSON;
    });

    res.json({ Reviews: formattedReviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add an Image to a Review based on the Review's id
router.post('/:reviewId/images', requireAuth, checkReview, async (req, res) => {
  const { reviewId } = req.params;
  const { url, preview } = req.body;
  const userId = req.user.id;

  try {

    const imagesCount = await ReviewImage.count({ where: { reviewId } });
    if (imagesCount >= 10) {
      return res.status(403).json({ message: "Maximum number of images for this resource was reached" });
    }

    const newImage = await ReviewImage.create({
      reviewId,
      url,
      preview,
    });

    return res.status(200).json({
      id: newImage.id,
      url: newImage.url
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while adding the image." });
  }
});

// Edit a review
router.put('/:reviewId', requireAuth, validateReview, checkReview, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  try {

    await Review.update(
      { review, stars },
      { where: { id: reviewId, userId } }
    );

    const updatedReview = await Review.findByPk(reviewId);

    return res.json(
        updatedReview.toJSON()
    );
  } catch (error) {
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

// Delete a Review
router.delete('/:reviewId', requireAuth, checkReview, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    const review = await Review.findByPk(reviewId);

    await review.destroy();

    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

module.exports = router;
