'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {

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
      ReviewImage.belongsTo(models.Review, { foreignKey: 'reviewId' });
    }
  }
  ReviewImage.init({
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'ReviewImage',
  });
  return ReviewImage;
};
