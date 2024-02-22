'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

      // Override the toJSON method to customize the JSON output
      toJSON() {
      let attributes = Object.assign({}, this.get());

      // Format createdAt and updatedAt using toLocaleString
        if (attributes.createdAt) {
          attributes.createdAt = new Date(attributes.createdAt)
            .toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
            .replace(',', '') // Remove the comma between date and time
            .replace(/\//g, '-'); // Replace slashes with dashes
          }

        if (attributes.updatedAt) {
          attributes.updatedAt = new Date(attributes.updatedAt)
            .toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
            .replace(',', '') // Remove the comma between date and time
            .replace(/\//g, '-'); // Replace slashes with dashes
          }
        return attributes;
      }
      
    static associate(models) {
      // define association here
      Booking.belongsTo(models.User, { foreignKey: 'userId', as: 'Guest' });
      Booking.belongsTo(models.Spot, { foreignKey: 'spotId' });
    }
  }
  Booking.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate:{
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};
