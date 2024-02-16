'use strict';

const { Review } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Review.bulkCreate([
      {
        userId: 1, // Adjust to match an actual user ID from your Users table
        spotId: 4, // Adjust to match an actual spot ID from your Spots table
        review: 'Fantastic place! Highly recommend to anyone looking for a cozy stay.',
        stars: 5,
      },
      {
        userId: 2, // Ensure this user exists
        spotId: 4, // Ensure this spot exists
        review: 'Great location, but a bit noisy at night. Overall, pretty good.',
        stars: 4,
      },
      {
        userId: 3, // This user ID should exist in your Users table
        spotId: 4, // This spot ID should exist in your Spots table
        review: 'Not as clean as I expected, but the host was very helpful.',
        stars: 3,
      }
      // Add more reviews as needed
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [4, 5, 6] }
    }, {});
  }
};
