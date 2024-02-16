'use strict';

const { SpotImage } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await SpotImage.bulkCreate([
      {
        spotId: 4, // Adjust to match an actual spot ID from your Spots table
        url: 'http://example.com/spot1/image1.jpg',
        preview: true,

      },
      {
        spotId: 4,
        url: 'http://example.com/spot1/image2.jpg',
        preview: false,
      },
      {
        spotId: 4, // Ensure this spot exists
        url: 'http://example.com/spot2/image1.jpg',
        preview: true,
      }
      // Add more images as needed
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [8, 9, 10] }
    }, {});
  }
};
