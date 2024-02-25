const express = require('express');
const { Booking, Review, Spot, User, ReviewImage, SpotImage } = require('../../db/models');
const { Op } = require('sequelize');
const { requireAuth } = require('../../utils/auth');
const { check} = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();


router.delete('/:imageId', requireAuth, async (req, res) => {
  const { imageId } = req.params;
  const userId = req.user.id;

  try {
    const reviewImage = await ReviewImage.findByPk(imageId);

    if (!reviewImage) {
      return res.status(404).json({ message: "Review Image couldn't be found" });
    }

    const review = await Review.findByPk(reviewImage.reviewId);

    if (review.userId !== userId) {
      return res.status(403).json({ message: "Forbidden. You don't have permission to delete this image." });
    }

    await reviewImage.destroy();

    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error('Error deleting review image:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
