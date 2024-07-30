import path from 'path'; // Node.js path module for handling file paths
import fs from 'fs'; // Node.js file system module for accessing file system
import Conversation from '../models/conversationModel.js';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';
import sequelize from '../models/config.js';
import { Op } from 'sequelize';


import { dirname } from 'path';
import { fileURLToPath } from 'url';
    
const __dirname = dirname(fileURLToPath(import.meta.url));

class ChatController {
  getConversation = async (req, res) => {
    try {
      const userId = req.query.userId;

      // Find conversations where the provided userId is either user1id or user2id
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { user1id: userId },
            { user2id: userId }
          ]
        },
        include: [
          { 
            model: User, 
            as: 'User1', 
            attributes: ['uid', 'fullName', 'profileImage','isVerified'], 
          },
          { 
            model: User, 
            as: 'User2', 
            attributes: ['uid', 'fullName', 'profileImage' , 'isVerified'],
          },
          { model: Message, limit: 1, order: [['timestamp', 'DESC']] } // Fetch most recent message
        ]
      });



      // Function to get full image URL from image name
      const getImageUrl = (imageName) => {
        if (imageName) {
          const serverUrl = `http://localhost:${process.env.PORT}`; // Replace with your server's URL
          return `${serverUrl}/uploads/${imageName}`; // Assuming images are stored in /uploads folder
        }
        return null; // Return null if imageName is null or undefined
      };

      // Extract the relevant data from the conversations
      const formattedConversations = conversations.map(conversation => {
        const currentUserId = parseInt(userId, 10);
        const user1Id = parseInt(conversation.user1id, 10);
        
        let otherUser;
        if (currentUserId === user1Id) {
          otherUser = {
            uid: conversation.User2.uid,
            fullName: conversation.User2.fullName,
            profileImage: getImageUrl(conversation.User2.profileImage), // Get full image URL
            isVerified:conversation.User2.isVerified,

          };
        } else {
          otherUser = {
            uid: conversation.User1.uid,
            fullName: conversation.User1.fullName,
            profileImage: getImageUrl(conversation.User1.profileImage), // Get full image URL
            isVerified:conversation.User1.isVerified,
          };
        }

        return {
          recentMessage: conversation.Messages[0]?.content,
          otherUser
        };
      }); 

      res.status(200).json(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  }

   getMessages = async (req, res) => {
    const senderId = req.query.senderId;
    const receiverId = req.query.receiverId;
  
    try {
      // Find the conversation based on senderId and receiverId
      const conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { user1id: senderId, user2id: receiverId },
            { user1id: receiverId, user2id: senderId }
          ]
        }
      });
  
      // If conversation is not found, handle accordingly
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      

      
  
      // Retrieve all messages associated with the found conversation
      const messages = await Message.findAll({
        where: {
          cvid: conversation.cvid
        },
        order: [['timestamp', 'ASC']] // Oldest message first
      });
  
      // Prepare response
      const response = {
        messages
      };
  
      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }



   insertMessage = async (data) => {
    console.log("Message data: ", data);
  
    const { senderId, receiverId, content, timestamp } = data;
  
    try {
      // Find the conversation where user1id = senderId and user2id = receiverId
      // or user1id = receiverId and user2id = senderId
      const conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            {
              user1id: senderId,
              user2id: receiverId
            },
            {
              user1id: receiverId,
              user2id: senderId
            }
          ]
        }
      });
  
      if (conversation) {
        console.log("Conversation ID (cvid): ", conversation.cvid);
  
        // Insert the new message into the Messages table
        const newMessage = await Message.create({
          cvid: conversation.cvid,
          senderId: senderId,
          content: content,
          timestamp: timestamp
        });
  
        console.log("New message inserted: ", newMessage);
      } else {
        console.log("No conversation found between these users.");
      }
    } catch (error) {
      console.error("Error finding conversation or inserting message: ", error);
    }
  };  

   initiateConversation = async (req, res) => {
    const { user1id, user2id } = req.query;
  
    try {
      // Check if the conversation already exists
      const existingConversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            {
              user1id: user1id,
              user2id: user2id
            },
            {
              user1id: user2id,
              user2id: user1id
            }
          ]
        }
      });
  
      if (existingConversation) {
        return res.status(200).json({
          message: 'Conversation already exists',
          conversation: existingConversation
        });
      }
  
      // Create a new conversation
      const newConversation = await Conversation.create({
        user1id: user1id,
        user2id: user2id
      });
  
      res.status(201).json({
        message: 'Conversation initiated successfully',
        conversation: newConversation
      });
    } catch (error) {
      console.error('Error initiating conversation:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  };
  
  
  
}

export default ChatController;
