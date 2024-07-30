
import sequelize from './config.js';
import { DataTypes } from 'sequelize';

const User = sequelize.define('User', {
  uid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phoneNo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isNumeric: true
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userType: {
    type: DataTypes.ENUM('Client', 'Freelancer'),
    allowNull: false
  },
  isVerified:{
    type:DataTypes.BOOLEAN,
    allowNull:false,
    type : DataTypes.BOOLEAN,
    defaultValue:false
  }
}, {
  timestamps: false
});



export default User;
