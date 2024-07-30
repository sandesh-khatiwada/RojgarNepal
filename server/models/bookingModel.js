import { DataTypes } from "sequelize";
import sequelize from "./config.js";
import User from "./userModel.js";

const Booking = sequelize.define('Booking', {
  bid: {
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
  },
  isCompleted:{
    type:DataTypes.BOOLEAN,
    allowNull:false
  }
}, {
  timestamps: true
});

Booking.belongsTo(User, { as: 'Client', foreignKey: 'uid' });
Booking.belongsTo(User, { as: 'AssignedFreelancer', foreignKey: 'freelanceruid' });
User.hasMany(Booking, { as: 'BookingsMade', foreignKey: 'uid' });
User.hasMany(Booking, { as: 'BookingsReceived', foreignKey: 'freelanceruid' });

export default Booking;
