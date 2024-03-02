const express = require('express');
const { Spot, Review, SpotImage, User, ReviewImage, Booking } = require('../../db/models');
const { Op } = require('sequelize');
const { requireAuth, checkForSpot, checkAuthenSpot } = require('../../utils/auth');
const { check, query} = require('express-validator');
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

const validatePagination = [
  query('page')
    .optional({ checkFalsy: true })
    .isInt({min: 1})
    .withMessage("Page must be greater than or equal to 1")
    .isInt({max: 10})
    .withMessage("Page must be less than or equal to 10"),
  query('size')
    .optional({ checkFalsy: true })
    .isInt({min:1})
    .withMessage("Size must be greater than or equal to 1")
    .isInt({max: 20})
    .withMessage("Size must be less than or equal to 20"),
  query('minLat')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Minimum latitude is invalid"),
  query('maxLat')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Maximum latitude is invalid"),
  query('minLng')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Minimum longitude is invalid"),
  query('maxLng')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Maximum longitude is invalid"),
  query('minPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be greater than or equal to 0"),
  query('maxPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be greater than or equal to 0"),
  handleValidationErrors
];

function calculateAvgRating(reviews) {
  if (reviews.length === 0) {
    return 'Be the first to review this spot';
  }

  let totalRating = 0;

  for (const review of reviews) {
    totalRating += review.stars;
  }

  const averageRating = totalRating / reviews.length;

  return parseFloat(averageRating.toFixed(1));
}

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

    spotJSON.avgRating = calculateAvgRating(spotJSON.Reviews);

    spotJSON.previewImage = findPreviewImage(spotJSON.SpotImages);

    delete spotJSON.SpotImages;
    delete spotJSON.Reviews;

    processedSpots.push(spotJSON);
  }

  return processedSpots;
}

// Get all Spots with Query Filters route
router.get('/', validatePagination, async (req, res) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;
  page = parseInt(page) || 1;
  size = parseInt(size) || 20;
  let where = {};

  // Latitude filtering
  if (minLat && maxLat) {
    // If both minLat and maxLat are provided, filter spots within the range
    where.lat = { 
      [Op.between]: [parseFloat(minLat), parseFloat(maxLat)] 
    };
  } else if (minLat) {
    // If only minLat is provided, filter spots with latitude greater than or equal to minLat
    where.lat = { 
      [Op.gte]: parseFloat(minLat) 
    };
  } else if (maxLat) {
    // If only maxLat is provided, filter spots with latitude less than or equal to maxLat
    where.lat = { 
      [Op.lte]: parseFloat(maxLat) 
    };
  }

  // Longitude filtering
  if (minLng && maxLng) {
    // If both minLng and maxLng are provided, filter spots within the range
    where.lng = { 
      [Op.between]: [parseFloat(minLng), parseFloat(maxLng)] 
    };
  } else if (minLng) {
    // If only minLng is provided, filter spots with longitude greater than or equal to minLng
    where.lng = { 
      [Op.gte]: parseFloat(minLng) 
    };
  } else if (maxLng) {
    // If only maxLng is provided, filter spots with longitude less than or equal to maxLng
    where.lng = { 
      [Op.lte]: parseFloat(maxLng) 
    };
  }

  // Price filtering
  if (minPrice && maxPrice) {
    // If both minPrice and maxPrice are provided, filter spots within the price range
    where.price = { 
      [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)] 
    };
  } else if (minPrice) {
    // If only minPrice is provided, filter spots with price greater than or equal to minPrice
    where.price = { 
      [Op.gte]: parseFloat(minPrice) 
    };
  } else if (maxPrice) {
    // If only maxPrice is provided, filter spots with price less than or equal to maxPrice
    where.price = { 
      [Op.lte]: parseFloat(maxPrice) 
    };
  }
  try {
    const spots = await Spot.findAll({
      where,
      limit: size,
      offset: (page - 1) * size,
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
    const formattedSpots = formatSpots(spots); 
    res.status(200).json({ 
      Spots: formattedSpots,
      page, 
      size 
    });
  } catch (error) {
    console.error('Error fetching spots:', error);
    res.status(500).json({ message: 'An error occurred while fetching spots.' });
  }
});

// Get all spots owned by current user
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
    const formattedSpots = formatSpots(spots);
    res.status(200).json({ Spots: formattedSpots });
  } catch (error) {
    console.error('Error fetching spots for current user:', error);
    res.status(500).json({ error: 'An error occurred while fetching spots.' });
  }
});

// Get details of a Spot from an id
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

    const avgStarRating = calculateAvgRating(spot.Reviews);

    const spotData = spot.toJSON();

    const formattedSpots = {
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

    res.json(formattedSpots);
  } catch (error) {
    console.error('Failed to get spot details:', error);
    res.status(500).json({ message: 'An error occurred while fetching spot details.' });
  }
});

// Create a Spot
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

// Add an Image to a Spot based on the Spots id
router.post('/:spotId/images', requireAuth, checkAuthenSpot, async (req, res, next) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const userId = req.user.id;

  try {
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

// Edit a Spot
router.put('/:spotId', requireAuth, validateSpot, checkAuthenSpot, async (req, res) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);

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

// Delete a Spot 
router.delete('/:spotId', requireAuth, checkAuthenSpot, async (req, res, next) => {
  const { spotId } = req.params;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);

    await spot.destroy();

    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error('Error deleting the spot:', error);
    next(error);
  }
});

// Get all Reviews by a Spot's id
router.get('/:spotId/reviews', checkForSpot, async (req, res) => {
  const spotId = parseInt(req.params.spotId);

  try {
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

// Create a Review for a Spot based on the Spots id
router.post('/:spotId/reviews', requireAuth, validateReview, checkForSpot, async (req, res) => {
  const spotId = parseInt(req.params.spotId);
  const { review, stars } = req.body;
  const userId = req.user.id;

  const existingReview = await Review.findOne({
    where: {
      userId,
      spotId,
    },
  });

  if (existingReview) {
    return res.status(500).json({ message: 'User already has a review for this spot' });
  }

  const newReview = await Review.create({
    userId,
    spotId,
    review,
    stars,
  });

  res.status(201).json(newReview);
});

// Get all Bookings for a Spot based on the Spot's id
router.get('/:spotId/bookings', requireAuth, checkForSpot ,async (req, res) => {
  try {
    const spotId = parseInt(req.params.spotId);
    const userId = req.user.id;

    const spot = await Spot.findByPk(spotId);

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

// Create a Booking from a Spot based on the Spots id
router.post('/:spotId/bookings', requireAuth, validateBooking, checkForSpot, async (req, res) => {

  const spotId = parseInt(req.params.spotId);
  const { startDate, endDate } = req.body;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);

    if (spot.ownerId === userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const conflictingBookings = await Booking.findAll({
      where: {
        spotId
      },
    });

    const startDateConflict = conflictingBookings.some(booking => {
      const format = date => date.toISOString().slice(0, 10)

      const existingStartDate = format(new Date(booking.startDate));
      const existingEndDate = format(new Date(booking.endDate));
      const newStartDate = format(new Date(startDate));
      const newEndDate = format(new Date(endDate));
    
      return (
        newStartDate >= existingStartDate && newStartDate <= existingEndDate ||
        newEndDate >= existingStartDate && newEndDate <= existingEndDate ||
        existingStartDate >= newStartDate && existingEndDate <= newEndDate
      );
    });

    if (startDateConflict) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking",
        },
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
