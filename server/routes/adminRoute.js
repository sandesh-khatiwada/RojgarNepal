import express from "express";
import adminAuthenticate from "../middlewares/adminAuthenticate.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Booking from "../models/bookingModel.js";
import Payment from "../models/paymentModel.js";
import JobPosting from "../models/jobPostingModel.js";
import emailTransporter from "../config/email.js";
import ProfileVerification from "../models/profileVerificationModel.js";

const router = express.Router();


import "dotenv/config"


router.post("/login",(req,res)=>{

    console.log(process.env.ADMIN_ID, process.env.ADMIN_PASSWORD);



    const id = req.body.id;
    const password = req.body.password;

    if(id==process.env.ADMIN_ID && password ==process.env.ADMIN_PASSWORD){

        const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });


        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token: token
        });

    }else{
        return res.status(400).json({success:false,message:"Invalid Login"});

    }

});


router.get('/users',adminAuthenticate, async (req, res) => {
    try {
      // Fetch all users, excluding the password field
      const users = await User.findAll({
        attributes: { exclude: ['password'] }
      });
  
      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  


  router.get("/bookings", adminAuthenticate,async (req, res) => {
    try {
      const bookings = await Booking.findAll({
        include: [
          {
            model: User,
            as: 'Client',
            attributes: ['fullName', 'email']
          },
          {
            model: User,
            as: 'AssignedFreelancer',
            attributes: ['fullName', 'email']
          },
          {
            model: Payment,
            attributes: ['pid'],
            required: false // This makes the join to the Payment table optional
          }
        ]
      });
  
      const result = bookings.map(booking => {
        return {
            bid:booking.bid,
          clientName: booking.Client.fullName,
          clientEmail: booking.Client.email,
          freelancerName: booking.AssignedFreelancer.fullName,
          freelancerEmail: booking.AssignedFreelancer.email,
          date: booking.date,
          jobTitle: booking.jobTitle,
          paymentStatus: booking.Payment ? 'Done' : 'Not done'
        };
      });
  
      res.json({ success: true, bookings: result });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  });

  router.get("/jobposts", adminAuthenticate,async (req, res) => {
    try {
const jobPosts = await JobPosting.findAll({
  include: [{
    model: User,
    attributes: ['profileImage', 'fullName'] // Only include profileImage and fullName from User model
  }],
  attributes: [
    'jpid',
    'jobTitle',
    'description',
    'proposedPayAmount',
    'date',
    'duration',
    'location',
    'createdAt'
  ],
  order: [['createdAt', 'DESC']] // Sort by createdAt in descending order
});
  
      const now = new Date();
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  


      const formattedJobPosts = jobPosts.map(job => {
        const createdAt = new Date(job.createdAt);
        const diffInSeconds = Math.floor((now - createdAt) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const diffInMonths = Math.floor(diffInDays / 30);
      
        let relativeTime;
      
        // If the job post was created within the last minute, show "0 mins ago"
        if (diffInSeconds < 60) {
          relativeTime = '0 mins ago';
        } else if (diffInMonths > 0) {
          relativeTime = rtf.format(-diffInMonths, 'month');
        } else if (diffInDays > 0) {
          relativeTime = rtf.format(-diffInDays, 'day');
        } else if (diffInHours > 0) {
          relativeTime = rtf.format(-diffInHours, 'hour');
        } else {
          relativeTime = rtf.format(-diffInMinutes, 'minute');
        }
      
        return {
          jobTitle: job.jobTitle,
          createdAt: relativeTime,
          description: job.description,
          proposedPayAmount: job.proposedPayAmount,
          date: job.date,
          duration: job.duration,
          location: job.location,
          profileImage: job.User.profileImage, // Access the profileImage from the included User model
          fullName: job.User.fullName
        };
      });
  
      res.json({
        success: true,
        jobPosts: formattedJobPosts
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching job posts.'
      });
    }
  });



  router.delete('/jobpost', async (req, res) => {
    const  jpid  = req.query.jpid; // Extract jpid from the query parameters
  
    if (!jpid) {
      return res.status(400).json({ success: false, message: 'Job ID (jpid) is required' });
    }
  
    try {
      // Find and delete the job post
      const jobPost = await JobPosting.destroy({ where: { jpid } });
  
      if (jobPost) {
        return res.json({ success: true, message: 'Job post deleted successfully' });
      } else {
        return res.status(404).json({ success: false, message: 'Job post not found' });
      }
    } catch (error) {
      console.error('Error deleting job post:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });


  router.get('/verification-docs', async (req, res) => {
    try {
      // Fetch all ProfileVerification records along with associated User data
      const profileVerifications = await ProfileVerification.findAll({
        include: [{
          model: User,
          attributes: ['uid', 'fullName', 'email', 'profileImage'] // Specify which attributes to include from User
        }],
        attributes: ['identityDoc', 'workDoc1', 'workDoc2', 'uid'] // Specify attributes from ProfileVerification
      });
  
      // Map the data to the desired structure
      const result = profileVerifications.map(pv => ({
        uid: pv.User.uid,
        fullName: pv.User.fullName,
        email: pv.User.email,
        profileImage: pv.User.profileImage,
        identityDoc: pv.identityDoc,
        workDoc1: pv.workDoc1,
        workDoc2: pv.workDoc2
      }));
  
      // Send the response
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching verification documents:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.post('/accept-verify', async (req, res) => {
    const { uid, fullName, email } = req.body;

    console.log(uid,fullName,email);
  
    try {
      // Update the `isVerified` field to true for the specified user
      const [updated] = await User.update(
        { isVerified: true },
        { where: { uid : uid } }
      );
       
      if (updated) {
        // Send confirmation email
        // const transporter = nodemailer.createTransport({
        //   service: 'gmail', // Or any other email service
        //   auth: {
        //     user: 'your-email@gmail.com',
        //     pass: 'your-email-password'
        //   }
        // });
        
        const mailOptions = {
          from: 'khatiwadasandesh01@gmail.com',
          to: email,
          subject: 'Profile Verification Accepted',
          text: `Hello ${fullName}, This is RojgarNepal. Your profile verification request has been accepted.`
        };
  
        emailTransporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent:', info.response);

     
          }
        });

        await ProfileVerification.destroy({
          where: {
            uid: uid
          }
        });
  
        res.status(200).json({ message: 'User verified and email sent' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  


  router.post("/reject-verify", async (req, res) => {
    const { uid, fullName, email, rejectionMessage } = req.body;
  
    try {
      const mailOptions = {
        from: 'khatiwadasandesh01@gmail.com',
        to: email,
        subject: 'Profile Verification Rejected',
        text: `Hello ${fullName}, This is RojgarNepal. Your profile verification request was rejected. 
        Rejection Message: ${rejectionMessage}`
      };
  
      emailTransporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          res.status(500).json({ message: 'Error sending email' });
        } else {
          console.log('Email sent:', info.response);
  
          // Delete the ProfileVerification instance for the provided uid
          try {
            await ProfileVerification.destroy({
              where: {
                uid: uid
              }
            });
  
            res.status(200).json({ message: 'User verification rejected, email sent, and record deleted' });
          } catch (deleteError) {
            console.error('Error deleting verification record:', deleteError);
            res.status(500).json({ message: 'Error deleting verification record' });
          }
        }
      });
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });



  
  

export default router;