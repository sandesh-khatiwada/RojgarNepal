import { DataTypes } from "sequelize";
import sequelize from "./config.js";
import User from "./userModel.js";
import Booking from "./bookingModel.js";

const Review = sequelize.define('Review', {
  rid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  cid: {  // Client foreign key
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'uid'
    }
  },
  frid: {  // Freelancer foreign key
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'uid'
    }
  },
  bid: {
    type: DataTypes.INTEGER,
    references: {
      model: Booking,
      key: 'bid'
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

// Define the relationships
Review.belongsTo(User, { foreignKey: 'cid', as: 'Client' });
Review.belongsTo(User, { foreignKey: 'frid', as: 'Freelancer' });
Review.belongsTo(Booking, { foreignKey: 'bid' });
User.hasMany(Review, { foreignKey: 'frid', as: 'Reviews' });
Booking.hasMany(Review, { foreignKey: 'bid', as: 'Reviews' });


export default Review;
