import { DataTypes } from "sequelize";
import sequelize from "./config.js";
import User from "./userModel.js";

const BookingRequest = sequelize.define('BookingRequest', {
  brid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  uid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'uid'
    }
  },
  freelanceruid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'uid'
    }
  },
  jobTitle: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  payAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

BookingRequest.belongsTo(User, { as: 'Requester', foreignKey: 'uid' });
BookingRequest.belongsTo(User, { as: 'Freelancer', foreignKey: 'freelanceruid' });
User.hasMany(BookingRequest, { as: 'RequestsMade', foreignKey: 'uid' });
User.hasMany(BookingRequest, { as: 'RequestsReceived', foreignKey: 'freelanceruid' });

export default BookingRequest;


