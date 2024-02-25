const express = require('express');
const { Review, Spot, User, ReviewImage, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
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
  return 'Currently no preview Image';
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

router.post('/:reviewId/images', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url, preview } = req.body;
  const userId = req.user.id;

  try {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }
    if (review.userId !== userId) {
      return res.status(403).json({ message: "Forbidden. You do not own this review." });
    }

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

router.put('/:reviewId', requireAuth, validateReview, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  try {
    const existingReview = await Review.findByPk(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }
    if (existingReview.userId !== userId) {
      return res.status(403).json({ message: "Forbidden. You do not own this review." });
    }


    await Review.update(
      { review, stars },
      { where: { id: reviewId, userId } }
    );

    const updatedReview = await Review.findByPk(reviewId);

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

    await review.destroy();

    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

module.exports = router;
