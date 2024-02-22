'use strict';
const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {

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
      User.hasMany(models.Spot, { foreignKey: 'ownerId' });
      User.hasMany(models.Review, { foreignKey: 'userId' });
      User.hasMany(models.Booking, { foreignKey: 'userId' });
    }
  };

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error("Cannot be an email.");
            }
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [3, 256],
          isEmail: true
        }
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60]
        }
      }
    },
    {
      sequelize,
      modelName: "User",
      defaultScope: {
        attributes: {
          exclude: ["hashedPassword", "email", "createdAt", "updatedAt"]
        }
      }
    }
  );
  return User;
};
