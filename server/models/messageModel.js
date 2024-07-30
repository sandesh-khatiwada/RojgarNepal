// messageModel.js
import { DataTypes } from "sequelize";
import sequelize from "./config.js";
import Conversation from "./conversationModel.js";
import User from "./userModel.js";

const Message = sequelize.define('Message', {
  mid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  cvid: {
    type: DataTypes.INTEGER,
    references: {
      model: Conversation,
      key: 'cvid'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'uid'
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  content:{
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: false
});

Conversation.hasMany(Message, { foreignKey: 'cvid' });
Message.belongsTo(Conversation, { foreignKey: 'cvid' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

export default Message;
