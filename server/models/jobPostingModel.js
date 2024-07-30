  import { DataTypes } from "sequelize";
  import sequelize from "./config.js";
  import User from "./userModel.js";


  const JobPosting = sequelize.define('JobPosting', {
    jpid: {
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
    jobTitle:{
      type:DataTypes.TEXT,
      allowNull:false
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
    serviceType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    latitude:{
      type:DataTypes.FLOAT,
      allowNull:true
    },
    longitude:{
      type:DataTypes.FLOAT,
      allowNull:true
    },
    proposedPayAmount:{
      type:DataTypes.FLOAT,
      allowNull:false
    },
    duration:{
      type:DataTypes.STRING,
      allowNull:false
    }
  }, {
    timestamps: true
  });

  JobPosting.belongsTo(User, { foreignKey: 'uid' });
  User.hasMany(JobPosting, { foreignKey: 'uid'}); 

  export default JobPosting;