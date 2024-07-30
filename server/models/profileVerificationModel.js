import sequelize from './config.js';
import { DataTypes } from 'sequelize';
import User from './userModel.js';  // Import the User model

const ProfileVerification = sequelize.define('ProfileVerification', {
  pvid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  identityDoc: {
    type: DataTypes.STRING,
    allowNull: false
  },
  workDoc1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  workDoc2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  uid: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'uid'
    },
    allowNull: false
  }
}, {
  timestamps: false
});

// Establish the relationship
User.hasMany(ProfileVerification, { foreignKey: 'uid' });
ProfileVerification.belongsTo(User, { foreignKey: 'uid' });

export default ProfileVerification;
