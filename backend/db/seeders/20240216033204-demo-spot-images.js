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
        url: 'https://res.klook.com/image/upload/c_fill,w_1265,h_712/q_80/activities/xvj3ajrf7rgb882pr7hj.jpeg',
        preview: true,

      },
      {
        spotId: 2,
        url: 'https://media.architecturaldigest.com/photos/621e2b8a0dfcde70e6b201e0/1:1/w_1707,h_1707,c_limit/SB_2614-HDR-scaled.jpeg',
        preview: true,
      },
      {
        spotId: 3,
        url: 'https://www.desertpalmshotel.com/resourcefiles/blogsmallimages/new-attractions-at-disneyland-2020-beyond.jpg',
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
