  import { DataTypes } from "sequelize";
  import sequelize from "./config.js";
  import User from "./userModel.js";


  const Service = sequelize.define('Service', {
    sid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    serviceType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    uid: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'uid'
      }
    },
    location:{
      type: DataTypes.STRING,
      allowNull:false
    },
    latitude:{
      type:DataTypes.FLOAT,
      allowNull:true
    },
    longitude:{
      type:DataTypes.FLOAT,
      allowNull:true
    }

  }, {
    timestamps: false
  });

  Service.belongsTo(User, { foreignKey: 'uid' });
  User.hasOne(Service, { foreignKey: 'uid', constraints: false, scope: { userType: 'Freelancer' } });


    export default Service;