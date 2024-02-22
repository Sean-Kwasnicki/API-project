'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
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
