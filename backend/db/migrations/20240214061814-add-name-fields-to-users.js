'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('User', 'firstName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('User', 'lastName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('User', 'firstName');
    await queryInterface.removeColumn('User', 'lastName');
  }
};
