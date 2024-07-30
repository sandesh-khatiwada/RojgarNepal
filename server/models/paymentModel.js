import { DataTypes } from "sequelize";
import sequelize from "./config.js";
import Booking from "./bookingModel.js";

const Payment = sequelize.define('Payment', {
    pid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    bid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Booking,
        key: 'bid'
      }
    },
    transaction_uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true  // Add unique constraint
    },
    transaction_amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
  }, {
    timestamps: true
  });
  

Booking.hasOne(Payment, { foreignKey: 'bid'}); 
Payment.belongsTo(Booking,{foreignKey:'bid'});


export default Payment;