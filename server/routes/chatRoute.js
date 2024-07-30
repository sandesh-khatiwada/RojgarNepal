import express from "express"
import ChatController from "../controllers/chatController.js";

const chatController = new ChatController();


const router = express.Router();


router.get("/conversations",chatController.getConversation);


router.get("/messages",chatController.getMessages);


router.post("/initiate-conversation",chatController.initiateConversation);


export default router;
