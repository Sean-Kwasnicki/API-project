// backend/utils/auth.js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User, Spot, Review, Booking } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
    // Create the token.
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    const token = jwt.sign(
      { data: safeUser },
      secret,
      { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Set the token cookie
    res.cookie('token', token, {
      maxAge: expiresIn * 1000, // maxAge in milliseconds
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction && "Lax"
    });

    return token;
  };

const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null;

    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
      if (err) {
        return next();
      }

      try {
        const { id } = jwtPayload.data;
        req.user = await User.findByPk(id, {
          attributes: {
            include: ['email', 'createdAt', 'updatedAt']
          }
        });
      } catch (e) {
        res.clearCookie('token');
        return next();
      }

      if (!req.user) res.clearCookie('token');

      return next();
    });
  };

// If there is no current user, return an error
// To be able to match API Docs needed to comment out errors message
const requireAuth = function (req, _res, next) {
    if (req.user) return next();

    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    //err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
};

const checkForSpot = async (req, res, next) => {
  const { spotId } = req.params;

  try {
    const spot = await Spot.findByPk(spotId);
    if(!spot) {
      return res.status(404).json({message: "Spot couldn't be found"})
    }
    req.spot = spot;
    next();
  } catch (error) {
    res.status(500).json({message: "Internal server error"})
  }
};

const checkAuthed = async (req, res, next) => {
  const { spotId } = req.params;
  const userId = req.user.id

  try {
    const spot = await Spot.findByPk(spotId);
    // if(!spot) {
    //   return res.status(404).json({message: "Spot couldn't be found"})
    // }
    if(spot.ownerId !== userId){
      return res.status(403).json({message: "Forbidden"});
    }
    req.spot = spot;
    next();
  } catch (error) {
    res.status(500).json({message: "Internal server error"})
  }
};

const checkReview = async (req, res, next) => {
  const { reviewId } = req.params
  const userId = req.user.id
  try {
    const review = await Review.findByPk(reviewId);
    if(!review){
      return res.status(404).json({ message: "Review couldn't be found" });
    }
    if (review.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.review = review;
    next();
  } catch (error) {
    console.error('Error in checkReview middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const checkBooking = async (req, res, next) => {
  const { bookingId } = req.params;
  const userId = req.user.id;
  const now = new Date();

  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (new Date(booking.startDate) < now) {
      return res.status(403).json({ message: "Past bookings can't be modified" });
    }

    // If all checks pass, add booking to the request object and call next middleware
    req.booking = booking;
    next();
  } catch (error) {
    console.error('Error in checkBooking middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { setTokenCookie, restoreUser, requireAuth, checkAuthed, checkReview, checkBooking, checkForSpot};
