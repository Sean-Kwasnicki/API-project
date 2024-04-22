'use strict';

const { Spot } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Spot.bulkCreate([
      {
        ownerId: 1,
        address: "12345 Disney Lane",
        city: "San Francisco",
        state: "CA",
        country: "USA",
        lat: 37.7749,
        lng: -122.4194,
        name: "Urban Retreat",
        description: "A cozy, modern spot in the heart of the city.",
        price: 250.00,
      },
      {
        ownerId: 2,
        address: "456 Pixar Road",
        city: "Emeryville",
        state: "CA",
        country: "USA",
        lat: 37.8353,
        lng: -122.2900,
        name: "Animation Haven",
        description: "Inspired by creativity, a perfect place for artists.",
        price: 300.00,
      },
      {
        ownerId: 3,
        address: "789 Marvel Ave",
        city: "Los Angeles",
        state: "CA",
        country: "USA",
        lat: 34.0522,
        lng: -118.2437,
        name: "Superhero Lair",
        description: "A superhero-themed spot for comic book fans.",
        price: 350.00,
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      ownerId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
