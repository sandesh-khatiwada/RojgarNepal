//basic imports
import express from "express";

const router = express.Router();
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


import multer from "multer";
import path from "path";
import upload from "../config/media.js";


import { dirname } from 'path';
import { fileURLToPath } from 'url';
    
const __dirname = dirname(fileURLToPath(import.meta.url));


//importing controllers

import AuthController from "../controllers/authController.js";
import UserController from "../controllers/userController.js";
import FreelancerController from "../controllers/freelancerController.js";
import MediaController from "../controllers/mediaController.js";
import ChatController from "../controllers/chatController.js";

//instantiating controller classes

const authController = new AuthController();
const userController = new UserController();
const freelancerController = new FreelancerController();
const mediaController = new MediaController();
const chatController = new ChatController();


//importing middlewares

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";



let fullName,email,password,confirmPassword,profileImage,phoneNo,location,userType;




// Signup Route
router.post('/signup',  async (req, res) => {
     fullName = req.body.fullName;
     email = req.body.email;
     password = req.body.password;
     confirmPassword = req.body.confirmPassword;
     phoneNo = req.body.phoneNo;
     location = req.body.location;
     userType = req.body.userType;

  const validation = await authController.validateInput(fullName,email,password,confirmPassword,phoneNo,location,userType);

  if (!validation.valid) {
   return  res.status(400).json({ success:false,message: validation.message });
  }else{
    
    const status = await authController.sendMail(email);

    if(status.success){
     return res.status(200).json({success:true,message:"OTP sent succesfully to your email address"});
    }else{
      return res.status(400).json({sucess:true,message:"Could not send OTP to your email address"});
    }
  
  }


});



router.post('/verify-otp', async (req, res) => {
  
  
  const { emailOtp } = req.body;

  if (!emailOtp) {
    return res.status(400).json({ success: false, message: "Please type OTP sent to your email" });
  }

  try {
    const status = await authController.verifyOTP(emailOtp);

    if(!status.success){
      return res.status(400).json({success:false,message:status.message});
    }

    const user = await userController.createUser(fullName, email, password, profileImage, phoneNo, location, userType);


    if (!user.success) {
      return res.status(500).json({ success: false, message: user.message });
    }

    const token = await authController.attachToken(user.uid,user.userType);

    // const payload = {
    //   userId: user.uid,
    //   userType:user.userType 
    // };

    // const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    // return res.status(200).json({ 
    //   success: true, 
    //   message: 'OTP verified and user created successfully',
    //   uid:userStatus.uid,
    //   email:userStatus.email,
    //   fullName:userStatus.fullName
    // });

    return res.json({ success:true,message:"OTP verified and user created succesfully",token:token,userId:user.uid,email:user.email,fullName:user.fullName, userType: user.userType});


  } catch (error) {
    // In case of unexpected errors, send a generic error response
    console.error(error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  });
  



  //Media Route (to handle image uploads and management)
  router.post('/upload', upload.single('image'),mediaController.uploadImage);

  
  //Service Route 
  router.post('/service', authenticate,authorize(['Freelancer']) ,freelancerController.createService);
  
// Login Route
router.post('/login',userController.logInUser);


//Payment Gateway Integration

export default router;

export {fullName,email,password,confirmPassword,profileImage,phoneNo,location,userType};