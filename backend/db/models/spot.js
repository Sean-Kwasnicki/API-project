'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    toJSON() {
      // Creates a shallow copy of the object returned by this.get() and assigns it to the variable attributes
      let attributes = Object.assign({}, this.get());
      // Check if createdAt and updatedAt exist before formatting
      // Use .toISOString on the createdAt/updatedAt to get this format of the date YYYY-MM-DDTHH:mm:ss.sssZ use .replace to manipualte to match API docs
      if (attributes.createdAt) {
        attributes.createdAt = attributes.createdAt.toISOString()
          .replace('T', ' ')
          .slice(0, 19);
      }
      if (attributes.updatedAt) {
        attributes.updatedAt = attributes.updatedAt.toISOString()
          .replace('T', ' ')
          .slice(0, 19);
      }
      return attributes;
    }

    static associate(models) {
      // define association here
      Spot.belongsTo(models.User, { foreignKey: 'ownerId', as: 'Owner' });
      Spot.hasMany(models.Review, { foreignKey: 'spotId' });
      Spot.hasMany(models.Booking, { foreignKey: 'spotId' });
      Spot.hasMany(models.SpotImage, { foreignKey: 'spotId' });
    }
  }
  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lat: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    lng: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};
