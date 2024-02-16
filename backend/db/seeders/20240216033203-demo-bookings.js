'use strict';

const { Booking } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Booking.bulkCreate([
      {
        userId: 7, // Adjust to match an actual user ID
        spotId: 4, // Adjust to match an actual spot ID
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // One week later

      },
      {
        userId: 8, // Adjust as necessary
        spotId: 5, // This and other spotIds should match actual spots
        startDate: new Date(new Date().setDate(new Date().getDate() + 10)), // 10 days from now
        endDate: new Date(new Date().setDate(new Date().getDate() + 14)), // 14 days from now

      },
      {
        userId: 9, // Repeat userIds if necessary to match your Users seed data
        spotId: 6, // Ensure spotId exists in your Spots table
        startDate: new Date(new Date().setDate(new Date().getDate() + 20)), // 20 days from now
        endDate: new Date(new Date().setDate(new Date().getDate() + 25)), // 25 days from now

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
