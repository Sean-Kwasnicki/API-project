const express = require('express');
const { Booking, Review, Spot, User, ReviewImage, SpotImage } = require('../../db/models');
const { Op } = require('sequelize');
const { requireAuth, checkBooking } = require('../../utils/auth');
const { check} = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateBooking = [
  check('startDate')
    .notEmpty()
    .withMessage('startDate is required')
    .isISO8601()
    .withMessage('startDate must be a valid date')
    .custom((value) => {
      const startDate = new Date(value);
      const now = new Date();
      if (startDate < now) {
        throw new Error('startDate cannot be in the past');
      }
      return true;
    }),

  check('endDate')
    .notEmpty()
    .withMessage('endDate is required')
    .isISO8601()
    .withMessage('endDate must be a valid date')
    .custom((value, { req }) => {
      if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
        throw new Error('endDate cannot be on or before startDate');
      }
      return true;
    }),
  handleValidationErrors
];

function findPreviewImage(spotImages) {
  for (const image of spotImages) {
    if (image.preview === true) {
      return image.url;
    }
  }
  return 'No preview image';
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
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { userId: userId },
      include: [{
        model: Spot,
        attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
        as: 'Spot',
        include: [{
          model: SpotImage,
          as: 'SpotImages',
        }]
      }]
    });

    const formattedBookings = bookings.map(booking => {
      const bookingJSON = booking.toJSON();

      const formattedSpot = formatSpots([bookingJSON.Spot]);

      return {
        id: bookingJSON.id,
        spotId: bookingJSON.spotId,
        Spot: formattedSpot,
        userId: bookingJSON.userId,
        startDate: bookingJSON.startDate,
        endDate: bookingJSON.endDate,
        createdAt: bookingJSON.createdAt,
        updatedAt: bookingJSON.updatedAt
      };
    });

  res.json({ Bookings: formattedBookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put('/:bookingId', requireAuth, validateBooking, checkBooking, async (req, res) => {
  const userId = req.user.id;
  const { bookingId } = req.params;
  const { startDate, endDate } = req.body;
  //const now = new Date();
  try {
    const booking = await Booking.findByPk(bookingId);
    // if (!booking) {
    //   return res.status(404).json({ message: "Booking couldn't be found" });
    // }
    // if (new Date(booking.endDate) < now) {
    //   return res.status(403).json({ message: "Past bookings can't be modified" });
    // }
    // if (booking.userId !== userId) {
    //   return res.status(403).json({ message: "You don't have permission to edit this booking" });
    // }

    const conflictingBookings = await Booking.findAll({
      where: {
        id: { [Op.ne]: bookingId }, // Exclude the current booking from the check
        spotId: booking.spotId,
        [Op.or]: [
          {
            startDate: {
              [Op.lt]: endDate,
              [Op.gt]: startDate,
            },
          },
          {
            endDate: {
              [Op.lt]: endDate,
              [Op.gt]: startDate,
            },
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } },
            ],
          },
          {
            [Op.and]: [
              { startDate: { [Op.gte]: startDate } },
              { endDate: { [Op.lte]: endDate } },
            ],
          }
        ],
      },
    });

    

    if (conflictingBookings.length > 0) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking",
        },
      });
    }
    
    await Booking.update(
      { startDate,
        endDate },
      { where: { id: bookingId } }
    );

    
      // Fetch the updated booking details
      const updatedBooking = await Booking.findByPk(bookingId);

    // Return the updated booking details
    res.json(updatedBooking);
  } catch (error) {
    console.error('Failed to update booking:', error);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

router.delete('/:bookingId', requireAuth, checkBooking, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const { startDate, endDate } = req.body;

  //const now = new Date();
  try {
    const booking = await Booking.findByPk(bookingId);

    // if (!booking) {
    //   return res.status(404).json({ message: "Booking couldn't be found" });
    // }
    // if (booking.userId !== userId) {
    //   return res.status(403).json({ message: "You do not have permission to delete this booking." });
    // }
    // if (new Date(booking.startDate) < now) {
    //   return res.status(403).json({ message: "Past bookings can't be modified" });
    // }

    await booking.destroy();

    return res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'An error occurred while deleting the booking.' });
  }
});


module.exports = router;
