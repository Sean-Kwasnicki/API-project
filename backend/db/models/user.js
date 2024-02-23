'use strict';
const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {

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
