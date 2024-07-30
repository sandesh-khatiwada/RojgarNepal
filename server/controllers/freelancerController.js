import User from "../models/userModel.js";
import Service from "../models/serviceModel.js";
import Booking from "../models/bookingModel.js";
import JobPosting from "../models/jobPostingModel.js";
import BookingRequest from "../models/bookingRequestmodel.js";
import Review from "../models/reviewModel.js";
import ProfileVerification from "../models/profileVerificationModel.js";
import Payment from "../models/paymentModel.js";

import { Op } from 'sequelize';
import path from "path";
// import sequelize from "../models/config.js";
import Sequelize from "sequelize";


import emailTransporter from "../config/email.js";



class FreelancerController {

createService = async (req,res)=>{

    const { userId, serviceName, serviceType, description, rate,location,latitude,longitude } = req.body;
  
    // Validate input
    if (!userId || !serviceName || !serviceType || !description || !rate || !location ) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    try {
        // Check if the user exists and is a Freelancer
        const user = await User.findOne({
          where: {
            uid: userId,
            userType: 'Freelancer'
          }
        });

        if (!user) {
          return res.status(400).json({ success: false, message: "User not found or is not a Freelancer" });
        }

        // Create a new service
        const newService = await Service.create({
          serviceName,
          serviceType,
          description,
          rate,
          location,
          latitude,
          longitude,
          isAvailable: true, // Assuming services are available by default
          uid: userId
        });

        // Respond with the created service
        return res.status(200).json({ success: true, message:"Service added succesfully" });
      } catch (error) {
        console.error("Error creating service:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
      }
        }



        getFreelancersByService = async (service)=>{
          if(!service){
            return null;
          }

          try {
            const services = await Service.findAll({
              where: {
                [Op.and]: [
                  {
                    [Op.or]: [
                      {
                        serviceType: {
                          [Op.like]: `%${service}%`
                        }
                      },
                      {
                        serviceName: {
                          [Op.like]: `%${service}%`
                        }
                      },
                      {
                        description: {
                          [Op.like]: `%${service}%`
                        }
                      }
                    ]
                  },
                  {
                    isAvailable: true
                  }
                ]
              },
              include: [
                {
                  model: User,
                  as: 'User', 
                  where: {
                    userType: 'Freelancer'
                  },
                  attributes: ['fullName', 'email', 'profileImage', 'phoneNo', 'location']
                }
              ]
            });
        
        
            return services;
          } catch (error) {
            console.error('Error finding services:', error);
            throw error;
            
          }


        };

          getStats = async (userId)=>{
            try {
              // Count job posts by the user
              const activeProjectsCount = await Booking.count({
                where: {
                  freelanceruid: userId, // Assuming uid is the foreign key in JobPost related to Users model
                  isCompleted:false
                }
              });
          
              // Count bookings by the user where isCompleted = false
              const completedProjectsCount = await Booking.count({
                where: {
                  freelanceruid: userId,
                  isCompleted: true
                }
              });

              const verified = await User.findOne({
                where:{
                  uid:userId,
                  isVerified:true
                }
            })

            let isVerified;

            if(verified){
                isVerified=true;
            }else{
              isVerified= false;
            }
          
       


              return {
                success: true,
                httpStatus:200,
                activeProjects: {
                  count: activeProjectsCount
                },
                completedProjects: {
                  count: completedProjectsCount
                },
                isVerified
              };
            } catch (error) {
              console.error('Error fetching stats:', error);
              return {
                success: false,
                httpStatus:500,
                message: 'Failed to fetch stats'
              };
            }
          }


          getRecentJobs = async()=>{
            try {
              const recentJobs = await JobPosting.findAll({
                order: [['createdAt', 'ASC']],
                include: [
                  {
                    model: User,
                    attributes: ['uid','fullName', 'profileImage','email']
                  }
                ]
              });
          
              const recentJobsWithUserDetails = recentJobs.map(job => {
                return {
                  ...job.dataValues,
                  User: {
                    ...job.User.dataValues,
                    profileImage: job.User.profileImage ? `${process.env.IMAGE_URL}/${job.User.profileImage}` : null
                  }
                };
              });
          
              return {
                httpStatus: 200,
                success: true,
                data: recentJobsWithUserDetails
              };
            } catch (error) {
              console.error('Error fetching recent jobs:', error);
              return {
                httpStatus: 500,
                success: false,
                message: 'Error fetching recent jobs'
              };
            }
          }


           sendMail = async (data) => {
            const { message, jobTitle, jobDescription, receiverEmail, fullName, senderEmail } = data;
          
            const mailOptions = {
              from: process.env.EMAIL_ADDRESS,
              to: receiverEmail,
              subject: 'A freelancer responded to your job post',
              text: `Hello, ${fullName}, This is RojgarNepal. A freelancer responded to a job you posted.
          
          Job Details:
          Job Title: ${jobTitle}
          Job Description: ${jobDescription}
          
          Freelancer's response:
          Email: ${senderEmail}
          Message: ${message}
          
          You can respond to his message from RojgarNepal site
          `
          

          ,
            };
          
            try {
              let info = await emailTransporter.sendMail(mailOptions);
              return{
                httpStatus:200,
                success:true,
                message:"Mail has been sent succesfully"
              }
            } catch (error) {
              console.error('Error sending email:', error);
              return{
                httpStatus:500,
                success:false,
                message:"Could not send email"
              }
            }
          };


   
 getBookingRequestsByFreelanceruid = async (req, res) => {
  try {
    const freelanceruid = req.query.freelanceruid; // Assuming freelanceruid is provided in req's query

    if (!freelanceruid) {
      return res.status(400).json({ error: 'Missing freelanceruid in query parameters' });
    }

    // Fetch booking requests where freelanceruid matches
    const bookingRequests = await BookingRequest.findAll({
      where: {
        freelanceruid: freelanceruid
      }
    });



    // If booking requests found, return them
    res.status(200).json(bookingRequests);
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    res.status(500).json({ error: 'Internal server error' }); // Handle other errors
  }
};


 getBookingsByFreelanceruid = async (req, res) => {
  try {
    const freelanceruid = req.query.freelanceruid; // Assuming freelanceruid is provided in req's query

    if (!freelanceruid) {
      return res.status(400).json({ error: 'Missing freelanceruid in query parameters' });
    }



    const bookings = await Booking.findAll({
      where: {
        freelanceruid: freelanceruid,
        isCompleted: false
      },
      order: [
        ['date', 'DESC'],
        ['time', 'DESC']
      ]
    });


    // If bookings found, return them
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' }); // Handle other errors
  }
};


 insertBooking = async (req, res) => {
  const { brid } = req.query; // Extract booking request id from query parameters

  try {
    // Fetch booking request data by brid
    const bookingRequest = await BookingRequest.findByPk(brid);
    if (!bookingRequest) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    // Create new booking based on booking request data
    const newBooking = new Booking({
      uid:bookingRequest.uid,
      freelanceruid: bookingRequest.freelanceruid,
      jobTitle:bookingRequest.jobTitle,
      description: bookingRequest.description,
      date: bookingRequest.date,
      time: bookingRequest.time,
      location: bookingRequest.location,
      latitude:bookingRequest.latitude,
      longitude:bookingRequest.longitude,
      payAmount: bookingRequest.payAmount,
      duration: bookingRequest.duration,
      isCompleted:false

    });

    // Save the new booking
    await newBooking.save();

    //delete the booking request after creating the booking
    const deletedBookingRequest = await BookingRequest.destroy({
      where: {
        brid: brid
      }
    });

    res.status(201).json({ message: 'Booking made successfully', booking: newBooking });
  } catch (error) {
    console.error('Error inserting booking:', error);
    res.status(500).json({ message: 'Failed to make booking', error: error.message });
  }
};


deleteBookingRequest = async (req,res)=>{

  const brid = req.query.brid;

    try{
      //delete the booking request after creating the booking
      const deletedBookingRequest = await BookingRequest.destroy({
        where: {
          brid: brid
        }
      });
      res.status(201).json({ message: 'Booking rejected successfully', booking: deletedBookingRequest });


    }catch(error){
      console.error('Error rejecting booking request:', error);
      res.status(500).json({ message: 'Failed to reject booking request', error: error.message });
    }

}

 getProfileData = async (req, res) => {
  const uid = req.query.userId;

  try {
    // Fetch the user's basic profile data
    const userProfile = await User.findOne({
      where: { uid },
      attributes: ['email', 'fullName', 'phoneNo', 'location', 'profileImage','isVerified']
    });

    if (!userProfile) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch and calculate the average rating from the Reviews table
    const reviewData = await Review.findOne({
      where: { frid: uid },
      attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'rating']]
    });

    // Convert userProfile to JSON
    const profile = userProfile.toJSON();

    // Add the average rating to the profile data
    profile.rating = reviewData ? reviewData.get('rating') : 0;

    return res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


 getClientInformationFromBookingId = async (req, res) => {
  const  bid  = req.query.bid; 

  console.log(bid);
  try {
    // Find the booking by bid
    const booking = await Booking.findOne({
      where: { bid },
      include: [{
        model: User,
        as: 'Client',
        attributes: ['fullName', 'email', 'profileImage', 'phoneNo']
      }]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Extract client information
    const clientInfo = booking.Client;

    res.json(clientInfo);
  } catch (error) {
    console.error('Error fetching client information:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


getPaymentInfoFromBookingId = async(req,res)=>{
    const bid = req.query.bid;

}


 getReviewFromBookingId = async (req, res) => {
  const bid = req.query.bid;

  try {
    const review = await Review.findOne({
      where: { bid }
    });

    if (!review) {
      return res.status(200).json({ message: 'No Review made' });
    }

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



 addProfileVerificationDocuments = async (req, res) => {
  try {
    const { email, userId } = req.body;
    // const identityDoc = req.files['identity-doc'] ? `${req.body.email}-identityDoc` : null;
    // const workDoc1 = req.files['work-doc1'] ? `${req.body.email}-workDoc1` : null;
    // const workDoc2 = req.files['work-doc2'] ? `${req.body.email}-workDoc2`: null;

    const identityDoc = req.files['identity-doc']
  ? `${req.body.email}-identityDoc${path.extname(req.files['identity-doc'][0].originalname)}`
  : null;

const workDoc1 = req.files['work-doc1']
  ? `${req.body.email}-workDoc1${path.extname(req.files['work-doc1'][0].originalname)}`
  : null;

const workDoc2 = req.files['work-doc2']
  ? `${req.body.email}-workDoc2${path.extname(req.files['work-doc2'][0].originalname)}`
  : null;


    console.log('Email:', email);
    console.log('User ID:', userId);
    console.log('Identity Document:', identityDoc);
    console.log('Work Document 1:', workDoc1);
    console.log('Work Document 2:', workDoc2);

    // Create and save the profile verification documents in the database
    const newProfileVerification = await ProfileVerification.create({
      uid: userId,
      identityDoc,
      workDoc1,
      workDoc2,
    });

    res.status(201).json({ message: 'Documents submitted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to submit documents for verification' });
  }
};


 getAllJobPosts = async (req, res) => {
  const { query: searchedQuery } = req.query; // Retrieve the query parameter from the request

  try {
    // Define the query options
    const queryOptions = {
      include: [
        {
          model: User, // Include user details
          attributes: ['uid', 'fullName', 'email', 'phoneNo', 'profileImage'], // Specify attributes to include from the User model
        },
      ],
    };

    // If there is a searchedQuery, add filtering options
    if (searchedQuery && searchedQuery.trim() !== '') {
      queryOptions.where = {
        [Op.or]: [
          { jobTitle: { [Op.like]: `%${searchedQuery}%` } }, // Case-insensitive match for jobTitle
          { description: { [Op.like]: `%${searchedQuery}%` } } // Case-insensitive match for description
        ],
      };
    }

    // Fetch the job postings based on query options
    const jobPosts = await JobPosting.findAll(queryOptions);

    // Respond with the job postings
    res.status(200).json(jobPosts);
  } catch (error) {
    console.error('Error fetching job postings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

getClientProfileInfo = async (req, res) => {
  try {
    const clientUid = req.query.clientUid;

    if (!clientUid) {
      return res.status(400).json({ message: 'clientUid is required' });
    }

    const user = await User.findOne({
      where: { uid: clientUid },
      attributes: { exclude: ['password', 'userType'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



// getPaymentInfo = async (req, res) => {
//   const bid = req.query.bid;

//   if (!bid) {
//     console.error('Error: bid is not provided');
//     return res.status(400).json({ message: 'bid is not provided' });
//   }

//   try {
//     const payment = await Payment.findOne({
//       where: { bid },
//       attributes: ['transaction_amount', 'createdAt']
//     });

//     if (!payment) {
//       console.info('Payment not found for bid:', bid);
//       return res.status(200).json({ message: 'Payment Not Initiated' });
//     }

//     console.info('Payment found:', payment);
//     return res.json({
//       paidAmount: payment.transaction_amount,
//       time: payment.createdAt
//     });
//   } catch (error) {
//     console.error('Error fetching payment info:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };


getClientProfileJobPosts = async (req, res) => {
  const clientUid = req.query.clientUid;

  try {
    // Find all job postings for the provided clientUid
    const jobPostings = await JobPosting.findAll({
      where: { uid: clientUid }
    });

    // Return the job postings in the response
    return res.status(200).json(jobPostings);
  } catch (error) {
    // Handle any errors
    console.error('Error fetching job postings:', error);
    return res.status(500).json({ error: 'Failed to fetch job postings' });
  }
};





          
      }
    

      


export default FreelancerController;


