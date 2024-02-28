'use strict';

const { SpotImage } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await SpotImage.bulkCreate([
      {
        spotId: 1,
        url: 'http://example.com/spot1/image1.jpg',
        preview: true,

      },
      {
        spotId: 2,
        url: 'http://example.com/spot1/image2.jpg',
        preview: false,
      },
      {
        spotId: 3,
        url: 'http://example.com/spot2/image1.jpg',
        preview: true,
      }
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
