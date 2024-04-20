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
        userId: 1,
        spotId: 2,
        review: 'Fantastic place! Highly recommend to anyone looking for a cozy stay.',
        stars: 5,
      },
      {
        userId: 2,
        spotId: 3,
        review: 'Great location, but a bit noisy at night. Overall, pretty good.',
        stars: 4,
      },
      {
        userId: 3,
        spotId: 1,
        review: 'Not as clean as I expected, but the host was very helpful.',
        stars: 3,
      }
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
