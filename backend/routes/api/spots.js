const express = require('express');
const { Spot, Review, SpotImage, User, ReviewImage, Booking } = require('../../db/models');
const { Op } = require('sequelize');
const { requireAuth, checkForSpot, checkAuthed } = require('../../utils/auth');
const { check} = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();


const validateSpot = [
  check('address')
    .notEmpty()
    .withMessage('Street address is required'),
  check('city')
    .notEmpty()
    .withMessage('City is required'),
  check('state')
    .notEmpty()
    .withMessage('State is required'),
  check('country')
    .notEmpty()
    .withMessage('Country is required'),
  check('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be within -90 and 90'),
  check('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be within -180 and 180'),
  check('name')
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .notEmpty()
    .withMessage('Description is required'),
  check('price')
    .isFloat({ min: 0 })
    .withMessage('Price per day must be a positive number'),
  handleValidationErrors
];

const validateReview = [
  check('review')
    .notEmpty()
    .withMessage('Review text is required'),
  check('stars')
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors
];

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
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('endDate cannot be on or before startDate');
      }
      return true;
    }),
  handleValidationErrors
];

function calculateAvgRating(reviews) {
  if (reviews.length === 0) {
    return 'Be the first to Reveiw this Spot'
  }

  let totalRating = 0;
  for (const review of reviews) {
    totalRating += review.stars
  }

  const averageRating = totalRating / reviews.length

  return Number(averageRating.toFixed(1))
}


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

    spotJSON.avgRating = calculateAvgRating(spotJSON.Reviews);

    spotJSON.previewImage = findPreviewImage(spotJSON.SpotImages);

    delete spotJSON.SpotImages;
    delete spotJSON.Reviews;

    processedSpots.push(spotJSON);
  }

  return processedSpots;
}

router.get('/', async (req, res) => {
  try {
    const spots = await Spot.findAll({
      include: [
        {
          model: SpotImage,
          as: 'SpotImages'
        },
        {
          model: Review,
          as: 'Reviews'
        }
      ]
    });
    const processedSpots = formatSpots(spots);
    res.status(200).json({ Spots: processedSpots });
  }

  catch (error) {
    console.error('Error fetching spots:', error);
    res.status(500).send({ error: 'An error occurred while fetching spots.' });
  }
});

router.get('/current', requireAuth, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const spots = await Spot.findAll({
      where: { ownerId: ownerId },
      include: [
        {
          model: SpotImage,
          as: 'SpotImages',
          where: { preview: true },
          required: false
      },
        {
          model: Review,
          as: 'Reviews'
        }
      ]
    });
    const processedSpots = formatSpots(spots);
    res.status(200).json({ Spots: processedSpots });
  } catch (error) {
    console.error('Error fetching spots for current user:', error);
    res.status(500).json({ error: 'An error occurred while fetching spots.' });
  }
});

router.get('/:spotId', checkForSpot, async (req, res) => {
  const { spotId } = req.params;
  try {
    const spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: SpotImage,
          as: 'SpotImages',
          attributes: ['id', 'url', 'preview']
      },
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'firstName', 'lastName']
      },
        {
          model: Review,
          as: 'Reviews',
          attributes: ['stars'] }
      ]
    });

    // if (!spot) {
    //   return res.status(404).json({ message: "Spot couldn't be found" });
    // }

    const avgStarRating = calculateAvgRating(spot.Reviews);

    const spotData = spot.toJSON();

    const response = {
      id: spotData.id,
      ownerId: spotData.Owner.id,
      address: spotData.address,
      city: spotData.city,
      state: spotData.state,
      country: spotData.country,
      lat: spotData.lat,
      lng: spotData.lng,
      name: spotData.name,
      description: spotData.description,
      price: spotData.price,
      createdAt: spotData.createdAt,
      updatedAt: spotData.updatedAt,
      numReviews: spotData.Reviews.length,
      avgStarRating: avgStarRating,
      SpotImages: spot.SpotImages,
      Owner: spot.Owner
    };

    res.json(response);
  } catch (error) {
    console.error('Failed to get spot details:', error);
    res.status(500).json({ message: 'An error occurred while fetching spot details.' });
  }
});

router.post('/', requireAuth, validateSpot, async (req, res) => {

  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const ownerId = req.user.id;

  try {
    const spot = await Spot.create({
      ownerId,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price
    });

    return res.status(201).json(spot);
  } catch (error) {
    console.error('Error creating a new spot:', error);
    res.status(500).json({ message: 'An error occurred while creating the spot.' });
  }
});

router.post('/:spotId/images', requireAuth, checkForSpot, checkAuthed, async (req, res, next) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const userId = req.user.id;

  try {
    // const spot = await Spot.findByPk(spotId);
    // if (!spot) {
    //   return res.status(404).json({ message: "Spot couldn't be found" });
    // }
    // if (spot.ownerId !== userId) {
    //   return res.status(403).json({ message: "Forbidden"});
    // }
   if (preview) {
    await SpotImage.update(
      { preview: false },
      { where: { spotId, preview: true } }
    );
  }

    const newImage = await SpotImage.create({
      spotId,
      url,
      preview
    });

    res.status(200).json({
      id: newImage.id,
      url: newImage.url,
      preview: newImage.preview
    });
  } catch (error) {
    console.error('Failed to add image to spot:', error);
    next(error);
  }
});

router.put('/:spotId', requireAuth, validateSpot, checkForSpot, checkAuthed, async (req, res) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);
    // if (!spot) {
    //   return res.status(404).json({ message: "Spot couldn't be found" });
    // }
    // if (spot.ownerId !== userId) {
    //   return res.status(403).json({ message: "Forbidden" });
    // }

    await spot.update({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price
    });

    res.json(spot);
  } catch (error) {
    console.error('Error updating the spot:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:spotId', requireAuth, checkForSpot, checkAuthed, async (req, res, next) => {
  const { spotId } = req.params;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);
    // if (!spot) {
    //   return res.status(404).json({ message: "Spot couldn't be found" });
    // }
    // if (spot.ownerId !== userId) {
    //   return res.status(403).json({ message: "Forbidden" });
    // }

    await spot.destroy();

    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error('Error deleting the spot:', error);
    next(error);
  }
});

router.get('/:spotId/reviews', checkForSpot, async (req, res) => {
  const spotId = parseInt(req.params.spotId);

  try {
    // const spotExists = await Spot.findByPk(spotId);
    // if (!spotExists) {
    //   return res.status(404).json({ message: "Spot couldn't be found" });
    // }
    const reviews = await Review.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url'],
        },
      ],
    });

    res.status(200).json({ Reviews: reviews });
  } catch (error) {
    console.error('Error fetching reviews for spot:', error);
    res.status(500).json({ message: 'An error occurred while fetching reviews.' });
  }
});

router.post('/:spotId/reviews', requireAuth, validateReview, checkForSpot, async (req, res) => {
  const spotId = parseInt(req.params.spotId);
  const { review, stars } = req.body;
  const userId = req.user.id;

    // const spotExists = await Spot.findByPk(spotId);
    // if (!spotExists) {
    //   return res.status(404).json({ message: "Spot couldn't be found" });
    // }

  const existingReview = await Review.findOne({
    where: {
      userId,
      spotId,
    },
  });

  if (existingReview) {
    return res.status(403).json({ message: 'User already has a review for this spot' });
  }

  const newReview = await Review.create({
    userId,
    spotId,
    review,
    stars,
  });

  res.status(201).json(newReview);
});


router.get('/:spotId/bookings', requireAuth, checkForSpot ,async (req, res) => {
  try {
    const spotId = parseInt(req.params.spotId);
    const userId = req.user.id;

    const spot = await Spot.findByPk(spotId);
    // if (!spot) {
    //   return res.status(404).json({ message: "Spot couldn't be found" });
    // }

    let bookings;

    if(spot.ownerId === userId) {;
      bookings = await Booking.findAll({
        where: { spotId },
        include: {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        }
      });
    } else {
      bookings = await Booking.findAll({
        where: { spotId },
        attributes: ['spotId', 'startDate', 'endDate']
      });
    }

    let formattedBookings = bookings.map(booking => {
      const bookingJSON = booking.toJSON();
      if(spot.ownerId === userId) {
        return {
          User: bookingJSON.User,
          id: bookingJSON.id,
          spotId: bookingJSON.spotId,
          userId: bookingJSON.userId,
          startDate: bookingJSON.startDate,
          endDate: bookingJSON.endDate,
          createdAt: bookingJSON.createdAt,
          updatedAt: bookingJSON.updatedAt
        };
      } else {
        return bookingJSON
      }
    })


    res.status(200).json({ Bookings: formattedBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'An error occurred while fetching bookings.' });
  }
});

router.post('/:spotId/bookings', requireAuth, validateBooking, checkForSpot, async (req, res) => {

  const spotId = parseInt(req.params.spotId);
  const { startDate, endDate } = req.body;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);
    // if (!spot) {
    //   return res.status(404).json({ message: "Spot couldn't be found" });
    // }
    if (spot.ownerId === userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const conflictingBookings = await Booking.findAll({
      where: {
        spotId,
        [Op.or]: [
          { startDate: {[Op.lte]: endDate} },
          { endDate: { [Op.gte]: startDate } },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking"
        }
      });
    }

    const booking = await Booking.create({
      spotId,
      userId,
      startDate,
      endDate,
    });

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'An error occurred while creating the booking.' });
  }
});


module.exports = router;
