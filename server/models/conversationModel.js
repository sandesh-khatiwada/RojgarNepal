// conversationModel.js
import { DataTypes } from "sequelize";
import sequelize from "./config.js";
import User from "./userModel.js";

const Conversation = sequelize.define('Conversation', {
  cvid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user1id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'uid'
    }
  },
  user2id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'uid'
    }
  }
}, {
  timestamps: false
});

// Define associations for both users with separate aliases
Conversation.belongsTo(User, { as: 'User1', foreignKey: 'user1id' });
Conversation.belongsTo(User, { as: 'User2', foreignKey: 'user2id' });

export default Conversation;
