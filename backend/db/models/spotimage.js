'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {

    toJSON() {
      let attributes = Object.assign({}, this.get());
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
      SpotImage.belongsTo(models.Spot, { foreignKey: 'spotId' });
    }
  }
  SpotImage.init({
    spotId: {
      type: DataTypes.INTEGER,
    },
    url: {
      type: DataTypes.STRING,
    },
    preview: {
      type: DataTypes.BOOLEAN
    },
  }, {
    sequelize,
    modelName: 'SpotImage',
  });
  return SpotImage;
};
