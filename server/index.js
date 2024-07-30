// index.js

import express from "express";
import "dotenv/config";
import sequelize from "./models/config.js";
import path from 'path';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import User from "./models/userModel.js";
import Service from "./models/serviceModel.js";
import JobPosting from "./models/jobPostingModel.js";
import Review from "./models/reviewModel.js";
import Conversation from "./models/conversationModel.js";
import Message from "./models/messageModel.js";
import Booking from "./models/bookingModel.js";
import BookingRequest from "./models/bookingRequestmodel.js";
import Payment from "./models/paymentModel.js";

import authenticate from "./middlewares/authenticate.js";
import authorize from "./middlewares/authorize.js";

import userRoute from "./routes/userRoute.js";
import clientRoute from "./routes/clientRoute.js";
import freelancerRoute from "./routes/freelancerRoute.js";
import chatRoute from "./routes/chatRoute.js";
import adminRoute from "./routes/adminRoute.js";

import cors from "cors";
import FreelancerController from "./controllers/freelancerController.js";
import ChatController from "./controllers/chatController.js";
import axios from "axios";

import crypto from "crypto";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from 'uuid';


const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();
const PORT = process.env.PORT || 5000;
const chatController = new ChatController();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static("./uploads"));
// app.use(express.static("./documents"));

app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/documents', express.static(path.join(__dirname, 'documents')));



// Synchronize all models
sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Error creating database tables:', err);
  });



  
// Initialize HTTP server and Socket.io
const server = http.createServer(app);
const io = new SocketIOServer(server,{
  cors:{
    origin: "http://localhost:5173", // React app origin
    methods: ["GET", "POST"]
  }
});

// Socket.io event handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Example: handle incoming messages
  socket.on('sendMessage', (data) => {
    console.log('Received message:', data);
    // Process the message as needed
    // Example: Broadcast to all clients


    chatController.insertMessage(data);


    io.emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Routes
app.get("/", async (req, res) => {
  res.send("Hello World");
});

app.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'This route is protected' });
});

app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/admin", adminRoute);


// Example route to fetch freelancers
const freelancerController = new FreelancerController();
app.get("/freelancers", async (req, res) => {
  const service = req.body.service;

  const result = await freelancerController.getFreelancersByService(service);

  if (!result) {
    res.status(400).json({ success: false, message: "Could not find freelancers" });
  } else {
    console.log(result);
    res.status(200).json({ success: true, data: { result } });
  }
});

app.use("/client", clientRoute);
app.use("/freelancer", freelancerRoute);




//Payment gateway 

app.get('/payment-success', (req, res) => {
  // Send a response to indicate payment success

  console.log(req.transaction_uuid);
  res.json({ success: true });
});

app.get('/payment-failure', (req, res) => {
  // Handle failed payment here

  console.log(req);
  res.json({success:false});
});

app.get("/payment-info",async(req,res)=>{
  const bid = req.query.bid;

  if (!bid) {
    console.error('Error: bid is not provided');
    return res.status(400).json({ message: 'bid is not provided' });
  }

  try {
    const payment = await Payment.findOne({
      where: { bid },
      attributes: ['transaction_amount', 'createdAt']
    });

    if (!payment) {
      console.info('Payment not found for bid:', bid);
      return res.status(200).json({ message: 'Payment Not Initiated' });
    }

    console.info('Payment found:', payment);
    return res.json({
      paidAmount: payment.transaction_amount,
      time: payment.createdAt
    });
  } catch (error) {
    console.error('Error fetching payment info:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/store-payment-info', async (req, res) => {
  const { transaction_uuid, bid, transaction_amount } = req.body;

  try {
    // Check if a payment already exists for the provided bid
    const existingPayment = await Payment.findOne({ where: { bid } });

    if (existingPayment) {
      // Respond that payment has already been made for this booking
      return res.json({ success: false, message: 'Payment already made for this booking' });
    }

    // Create a new instance of the Payment model
    const newPayment = await Payment.create({
      transaction_uuid,
      bid,
      transaction_amount
    });

    res.json({ success: true, payment: newPayment });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, error: 'Failed to store payment info' });
  }
});

// Function to create initial instances (users, services, bookings, etc.)
async function createInstances() {
  try {
    // Create User instances
    const client = await User.create({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      profileImage: null,
      phoneNo: '1234567890',
      location: 'Kathmandu, Nepal',
      userType: 'Client'
    });

    const freelancer = await User.create({
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'password123',
      profileImage: null,
      phoneNo: '0987654321',
      location: 'Pokhara, Nepal',
      userType: 'Freelancer'
    });

    console.log('Users created!');

    // Create Service instance
    const service = await Service.create({
      serviceName: 'Web Development',
      serviceType: 'IT',
      description: 'Full stack web development service.',
      rate: "50 per project",
      isAvailable: true,
      uid: freelancer.uid, // Link service to the freelancer
      location: "Kathmandu",
      latitude: 27.700769,
      longitude: 85.300140
    });

    console.log('Service created!');

    // Create Booking instance
    const booking = await Booking.create({
      uid: client.uid,
      sid: service.sid,
      bookingDate: new Date(),
      isCompleted: false,
      bookingTime: '10:00:00'
    });

    console.log('Booking created!');

    // Create Review instance
    const review = await Review.create({
      uid: client.uid,
      bid: booking.bid,
      comment: 'Great service!',
      rating: 5,
      timestamp: new Date()
    });

    console.log('Review created!');

    // Create JobPosting instance
    const jobPosting = await JobPosting.create({
      uid: client.uid,
      jobTitle: 'Web dev needed',
      description: 'Looking for a web developer for a new project.',
      location: 'Lalitpur, Nepal',
      latitude: '2',
      longitude: '2',
      date: "2015-01-21",
      time: '14:00:00',
      serviceType: 'IT',
      proposedPayAmount: 500
    });

    console.log('JobPosting created!');

    // Create Conversation instance
    const conversation = await Conversation.create({
      user1id: client.uid,
      user2id: freelancer.uid
    });

    console.log('Conversation created!');

    // Create Message instance
    const message = await Message.create({
      cvid: conversation.cvid,
      senderId: client.uid,
      timestamp: new Date(),
      content: "Hello There"
    });

    console.log('Message created!');

  } catch (error) {
    console.error('Error creating instances:', error);
  }
}

// Call createInstances function to create initial data
// createInstances();






// Start server
server.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
