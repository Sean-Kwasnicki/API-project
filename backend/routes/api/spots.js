const express = require('express');
const { Spot, Review, SpotImage, User, ReviewImage} = require('../../db/models');

const { requireAuth } = require('../../utils/auth');
const { check} = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Validation middleware for Valid Spot
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

// Helper function to find average star rating
function calculateAvgRating(reviews) {
  // Check if there are no reviews
  if (reviews.length === 0) {
    return 'No ratings yet';
  }

  // Initialize totalRating to 0
  let totalRating = 0;

  // Loop through each review and add its stars to totalRating
  for (const review of reviews) {
    totalRating += review.stars;
  }

  // Calculate the average rating
  const averageRating = totalRating / reviews.length;

  // Return the average rating formatted to one decimal place to match API Docs
  return averageRating.toFixed(1);
}

// Helper function to find a preview image
function findPreviewImage(spotImages) {
  for (const image of spotImages) {
    // Should only return on photo that is true
    if (image.preview === true) {
      return image.url;
    }
  }
  return 'No preview image';
}


// Function to process each spot, calculate the average rating, and find preview images
function processSpots(spots) {
  let processedSpots = [];

  for (const spot of spots) {
    let spotJSON = spot.toJSON();

    // Calculate average rating using helper function
    spotJSON.avgRating = calculateAvgRating(spotJSON.Reviews);

    // Find preview images using helper function
    spotJSON.previewImages = findPreviewImage(spotJSON.SpotImages);

    delete spotJSON.SpotImages;
    delete spotJSON.Reviews;

    processedSpots.push(spotJSON);
  }

  return processedSpots;
}

// Get all Spots
// Return all the spots
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
    const processedSpots = processSpots(spots);
    res.status(200).json({ Spots: processedSpots });
  }

  catch (error) {
    console.error('Error fetching spots:', error);
    res.status(500).send({ error: 'An error occurred while fetching spots.' });
  }
});

// Get all Spots owned by the Current User
// Returns all the spots owned (created) by the current user.
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
    const processedSpots = processSpots(spots);
    res.status(200).json({ Spots: processedSpots });
  } catch (error) {
    console.error('Error fetching spots for current user:', error);
    res.status(500).json({ error: 'An error occurred while fetching spots.' });
  }
});


// Route to get details of a Spot by its ID
router.get('/:spotId', async (req, res) => {
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

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Calculate avgStarRating
    const avgStarRating = calculateAvgRating(spot.Reviews);

    // Convert sequelize model instance to JSON
    const spotData = spot.toJSON();

    // Construct response Ill try and make this better but only way I could figure out how to match the output
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

// Create a Spot Route
// Creates and returns a new spot.

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


// Add an Image to a Spot based on the Spot's id
// Create and return a new image for a spot specified by id.
router.post('/:spotId/images', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const userId = req.user.id;

  try {
    // Verify the spot exists and belongs to the current user
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }
    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: "Forbidden. You do not have permission to add an image to this spot." });
    }

   // If the new image is marked as preview: true, set all existing images' preview: false
   if (preview) {
    await SpotImage.update(
      { preview: false },
      { where: { spotId, preview: true } }
    );
  }

    // Create the SpotImage
    const newImage = await SpotImage.create({
      spotId,
      url,
      preview
    });

    // Send the successful response
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
// Updates and returns an existing spot.
router.put('/:spotId', requireAuth, validateSpot, async (req, res) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);

    // Check if the spot exists
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if the current user is the owner of the spot
    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: "User is not authorized to edit this spot" });
    }

    // Update the spot
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

//Delete a Spot by Id

router.delete('/:spotId', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);

    // Check if the spot exists
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if the current user is the owner of the spot
    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: "User is not authorized to delete this spot" });
    }

    // Delete the spot
    await spot.destroy();

    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error('Error deleting the spot:', error);
    next(error);
  }
});

// Get all reviews by a spot's ID
router.get('/:spotId/reviews', async (req, res) => {
  const { spotId } = req.params;

  try {
    // Check if the spot exists
    const spotExists = await Spot.findByPk(spotId);
    if (!spotExists) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Fetch the reviews for the spot
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

// Create a Review for a Spot based on the Spot's id
router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
  const { spotId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  // Check for existing review by this user for the spot
  const existingReview = await Review.findOne({
    where: {
      userId,
      spotId,
    },
  });

  if (existingReview) {
    return res.status(403).json({ message: 'User already has a review for this spot' });
  }

  // Create new review
  const newReview = await Review.create({
    userId,
    spotId,
    review,
    stars,
  });

  // Return newly created review data
  res.status(201).json(newReview);
});

module.exports = router;
