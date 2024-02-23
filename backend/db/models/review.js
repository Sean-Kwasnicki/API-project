'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

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
      // define association here
    Review.belongsTo(models.User, { foreignKey: 'userId'});
    Review.belongsTo(models.Spot, { foreignKey: 'spotId' });
    Review.hasMany(models.ReviewImage, { foreignKey: 'reviewId' });
    }
  }
  Review.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};
