'use strict';

const { ReviewImage } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await ReviewImage.bulkCreate([
      {
        reviewId: 1, // Adjust to match an actual review ID from your Reviews table
        url: 'http://example.com/review1/image1.jpg',
      },
      {
        reviewId: 2, // Ensure this review exists
        url: 'http://example.com/review2/image1.jpg',
      },
      {
        reviewId: 3, // Adjust based on your Reviews seed data
        url: 'http://example.com/review3/image1.jpg',
      }
      // Add more images as needed
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      reviewId: { [Op.in]: [7, 8, 9] }
    }, {});
  }
};
