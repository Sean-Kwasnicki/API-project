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
    const spotImage = await SpotImage.findByPk(imageId, {
      include: {
        model: Spot,
        as: 'Spot'
      }
    });

    if (!spotImage) {
      return res.status(404).json({ message: "Spot Image couldn't be found" });
    }

    if (spotImage.Spot.ownerId !== userId) {
      return res.status(403).json({ message: "Forbidden. You do not have permission to delete this image." });
    }

    await spotImage.destroy();

    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error('Error deleting spot image:', error);
    res.status(500).json({ message: 'An error occurred while deleting the spot image.' });
  }
});

module.exports = router;
