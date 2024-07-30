import { DataTypes } from "sequelize";
import sequelize from "./config.js";
import User from "./userModel.js";


const Jobs = sequelize.define('Jobs', {
  job_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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


export default Jobs;

