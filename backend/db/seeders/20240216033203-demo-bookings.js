'use strict';

const { Booking } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Booking.bulkCreate([
      {
        userId: 1,
        spotId: 4,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),

      },
      {
        userId: 2, // Adjust as necessary
        spotId: 4, // This and other spotIds should match actual spots
        startDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 14)),

      },
      {
        userId: 3,
        spotId: 4, 
        startDate: new Date(new Date().setDate(new Date().getDate() + 20)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 25)),

      }
      // Add more bookings as needed
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [4, 5, 6] }
    }, {});
  }
};
