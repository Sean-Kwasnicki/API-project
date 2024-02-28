'use strict';

const { ReviewImage } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await ReviewImage.bulkCreate([
      {
        reviewId: 1,
        url: 'http://example.com/review1/image1.jpg',
      },
      {
        reviewId: 2,
        url: 'http://example.com/review2/image1.jpg',
      },
      {
        reviewId: 3,
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
