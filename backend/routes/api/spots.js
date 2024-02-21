
const express = require('express');
const { Spot, Review, SpotImage, User, sequelize } = require('../../db/models');
const bcrypt = require('bcryptjs');

const { requireAuth } = require('../../utils/auth');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

///////////////////////////////////////////////////////////////

// Get all Spots -- Return all the spots
router.get('/', async (req, res, next) => {
  try {
    // Step 1: Fetch all spots including associated SpotImages and Reviews
    const spots = await Spot.findAll({
      include: [
        {
          model: SpotImage,
          as: 'SpotImages',
        },
        {
          model: Review,
          as: 'Reviews',
        }
      ]
      });

      // Step 2: Process each spot to calculate avgRating and find previewImage
      const processedSpots = spots.map(spot => {
      const spotJSON = spot.toJSON();

      // Calculate average rating
      const avgRating = spotJSON.Reviews.reduce((acc, review) => acc + review.stars, 0) / spotJSON.Reviews.length || null;
      spotJSON.avgRating = avgRating ? parseFloat(avgRating.toFixed(1)) : 'No ratings yet';

      // Find preview image URL
      const previewImage = spotJSON.SpotImages.find(image => image.preview) || null;
      spotJSON.previewImage = previewImage ? previewImage.url : 'No preview image';

      // Remove SpotImages and Reviews from the response as needed
      delete spotJSON.SpotImages;
      delete spotJSON.Reviews;

      return spotJSON;
    });

      res.status(200).json({ Spots: processedSpots });
  } catch (error) {
      console.error('Error fetching spots:', error);
      res.status(500).send({ error: 'An error occurred while fetching spots.' });
  }
});

//////////////////////////////////////////////////////////////

//Get all Spots owned by the Current User
//Returns all the spots owned (created) by the current user.

router.get('/current', requireAuth, async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Fetch all spots owned by the current user
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

    // Process each spot to calculate average rating and attach preview image URL
    const processedSpots = spots.map(spot => {
    const spotJSON = spot.toJSON();

    // Calculate average rating
    let avgRating = 0;
    if (spotJSON.Reviews.length) {
      const totalRating = spotJSON.Reviews.reduce((total, review) => total + review.stars, 0);
      avgRating = (totalRating / spotJSON.Reviews.length).toFixed(2);
    }

    // Find preview image URL
    const previewImage = spotJSON.SpotImages.length ? spotJSON.SpotImages[0].url : 'No preview image available';


    return {
      ...spotJSON,
      avgRating: avgRating,
      previewImage: previewImage
      };
    });

      res.status(200).json({ Spots: processedSpots });
  } catch (error) {
      console.error('Error fetching spots for current user:', error);
      res.status(500).json({ error: 'An error occurred while fetching spots.' });
  }
});

/////////////////////////////////////////////////////////////////

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
          attributes: ['stars']
        }
      ]
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Calculate numReviews and avgStarRating
    const numReviews = spot.Reviews.length;
    const avgStarRating = numReviews > 0
      ? parseFloat((spot.Reviews.reduce((acc, curr) => acc + curr.stars, 0) / numReviews).toFixed(1))
      : 0;

    // Constructing the response to match the specified format
    const response = {
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      numReviews,
      avgStarRating,
      SpotImages: spot.SpotImages,
      Owner: spot.Owner
    };

    res.json(response);
  } catch (error) {
    console.error('Failed to get spot details:', error);
    res.status(500).json({ message: 'An error occurred while fetching spot details.' });
  }
});

/////////////////////////////////////////////////////////////

// Create a Spot
// Creates and returns a new spot.

// Validation middleware
const validateSpot = [
  check('address').notEmpty().withMessage('Street address is required'),
  check('city').notEmpty().withMessage('City is required'),
  check('state').notEmpty().withMessage('State is required'),
  check('country').notEmpty().withMessage('Country is required'),
  check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
  check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
  check('name').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
  check('description').notEmpty().withMessage('Description is required'),
  check('price').isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
];

///////////////////////////////////////////////////////////////

// Helper function to calculate average rating
function calculateAvgRating(reviews) {
  if (reviews.length === 0) return 'No ratings yet';
  const totalRating = reviews.reduce((acc, review) => acc + review.stars, 0);
  return parseFloat((totalRating / reviews.length).toFixed(1));
}

// Helper function to find a preview image
function findPreviewImage(spotImages) {
  const previewImage = spotImages.find(image => image.preview) || null;
  return previewImage ? previewImage.url : 'No preview image';
}

// Function to process spots
function processSpots(spots) {
  return spots.map(spot => {
    const spotJSON = spot.toJSON();
    spotJSON.avgRating = calculateAvgRating(spotJSON.Reviews);
    spotJSON.previewImage = findPreviewImage(spotJSON.SpotImages);
    delete spotJSON.SpotImages;
    delete spotJSON.Reviews;
    return spotJSON;
  });
}


// Get all Spots
// Return all the spots
router.get('/', async (req, res) => {
  try {
    const spots = await Spot.findAll({
      include: [
        { model: SpotImage, as: 'SpotImages' },
        { model: Review, as: 'Reviews' }
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

//Get all Spots owned by the Current User
//Returns all the spots owned (created) by the current user.
router.get('/current', requireAuth, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const spots = await Spot.findAll({
      where: { ownerId: ownerId },
      include: [
        { model: SpotImage, as: 'SpotImages', where: { preview: true }, required: false },
        { model: Review, as: 'Reviews' }
      ]
    });
    const processedSpots = processSpots(spots);
    res.status(200).json({ Spots: processedSpots });
  } catch (error) {
    console.error('Error fetching spots for current user:', error);
    res.status(500).json({ error: 'An error occurred while fetching spots.' });
  }
});


// // Route to get details of a Spot by its ID
router.get('/:spotId', async (req, res) => {
  const { spotId } = req.params;
  try {
    const spot = await Spot.findByPk(spotId, {
      include: [
        { model: SpotImage, as: 'SpotImages', attributes: ['id', 'url', 'preview'] },
        { model: User, as: 'Owner', attributes: ['id', 'firstName', 'lastName'] },
        { model: Review, as: 'Reviews', attributes: ['stars'] }
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
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ message: "Bad Request", errors: validationErrors.array().map(error => error.msg) });
  }

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

///////////////////////////////////////////////////////

// Add an Image to a Spot based on the Spot's id
// Create and return a new image for a spot specified by id.
// Add an image to a Spot based on the Spot's id
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
    next(error); // Pass errors to the error handler
  }
});
//////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////

// Edit a Spot
// Updates and returns an existing spot.

router.put('/:spotId', requireAuth, validateSpot, async (req, res) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const userId = req.user.id;

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((error) => error.msg) });
  }

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


// Delete a Spot
// Delete an existing spot.
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


module.exports = router;
