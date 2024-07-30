// Checks the validity of input data provided by user during the signup process


import User from "../models/userModel.js";


import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";

import emailTransporter from "../config/email.js";
import bcrypt from "bcrypt";

import { email } from "../routes/userRoute.js";

import jwt from "jsonwebtoken";

import "dotenv/config";


// In-memory store for OTPs (Later used to check if the OTP entered by user is valid)
const otpStore = new Map();

class AuthController{

     validateInput = async  (fullName, email, password,confirmPassword, phoneNo, location, userType) => {


      //Validating email,phone and password using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

        if (!emailRegex.test(email)) return { valid: false, message: 'Invalid email format' };
        if (!phoneRegex.test(phoneNo)) return { valid: false, message: 'Invalid phone number format' };
        if (!passwordRegex.test(password)) return { valid: false, message: 'Password must be of at least 8 characters with a number and a special character' };

        //making sure fields are not empty and password and confirm Password match


        if(!fullName) return {valid:false,message:"Name can't be empty"};
        if(!location)return { valid: false, message: 'Location cant be empty'};
        if(!userType) return{valid:false,message:"User type can't be empty"};
    

        if(password!=confirmPassword) return{valid:false,message:"Password and Confirm Password do not match."};



         // Check if the user already has an account of the same type
         //Client can open another Freelancer account with same email but not another Client account and vice versa
      
        try {
          const existingUser = await User.findOne({ where: { email, userType } });
      
          if (existingUser) {
           return  {valid:false,message:'User already has an account with this type'};
          }

          
     
        } catch (error) {
          return {valid:false,message:"Error"}; 
        }

        return { valid: true };
      };




    sendMail= async (email)=>{






            //2. send OTP to email 


            const emailOtp = otpGenerator.generate(4, { digits: true, alphabets: false, upperCaseAlphabets: false, lowerCaseAlphabets:false, specialChars: false });

      console.log(emailOtp);
            const hashedEmailOtp = await bcrypt.hash(emailOtp, 10);


            otpStore.set(email, { emailOtp: hashedEmailOtp });

            const mailOptions = {
              from: process.env.EMAIL_ADDRESS,
              to: email,
              subject: 'Your Email OTP Code',
              text: `Your OTP code is ${emailOtp}`
            };



            emailTransporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error(error);
                 return {success:false, error: 'Failed to send email OTP' };
              }
            
            
              // res.status(200).json({status:success,message:"OTP sent to your email address"});
              // res.status(200).json({status:"success",message:"OTP sent succesfully to your email address"});

            });



            return {success:true,message:"OTP sent succesfully"};
      }




    verifyOTP = async (emailOtp)=>{

  
    const storedOtps = otpStore.get(email);

    

    // console.log(storedOtps);
    if (!storedOtps) {
      // return res.status(400).json({ error: 'OTP not found or expired' });

      return ({success:false,message:"OTP not found or expired"});
    }

      console.log(storedOtps.emailOtp);
  
    const isEmailOtpValid = await bcrypt.compare(emailOtp, storedOtps.emailOtp);

  
    if (!isEmailOtpValid) {
      // return res.status(400).json({ error: 'Invalid OTP' });

      return({success:false,message:"Invalid OTP"});
    }
  

    otpStore.delete(email);
    return({success:true,message:"Email verified succesfully"});

      }


    attachToken = async (userId, userType)=>{
      const payload = {
        userId: userId,
        userType:userType 
      };
  
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

      return token;
      
    }

    


}


export default AuthController;