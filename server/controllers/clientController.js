import JobPosting from "../models/jobPostingModel.js";
import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";
import path from "path";
import BookingRequest from "../models/bookingRequestmodel.js";
import Review from "../models/reviewModel.js";
import Payment from "../models/paymentModel.js";
import Service from "../models/serviceModel.js";
import sequelize from "../models/config.js";
import Jobs from "../models/jobModel.js";
import { Op } from 'sequelize';
import axios from 'axios';
import { fn, col ,literal } from 'sequelize';

class ClientController{

    postJob = async(data)=>{
                let {userId,jobTitle,description,date,time,serviceType,location,latitude,longitude,proposedPayAmount,duration}= data;
                const uid = userId;




                if(!uid || !jobTitle || !description || !date || !time || !serviceType || !location || !proposedPayAmount || !duration){
                   return{
                    success:false,
                    httpStatus:400,
                    message:"Please Fill All the Fields"
                   }
                }

                if( latitude== 27.7172 && longitude== 85.3240 ){
                  latitude=null;
                  longitude=null;
                }

                try{


                const DBresponse = await JobPosting.create({uid,jobTitle,description,date,time,serviceType,location,latitude,longitude,proposedPayAmount,duration});

                return{
                    success:true,
                    httpStatus:200,
                    message:"Job Posted Succesfully",
                    data : DBresponse
                }


                }catch(err){
                    console.log(err);
                    return {
                        success:false,
                        httpStatus:500,
                        message:"Internal Server Error"
                    }
                }

                
    }


    getTredingJobPostings = async()=>{

        try{
          const posts = await JobPosting.findAll({
            include: {
              model: User,
              attributes: ['fullName', 'profileImage']
            },
            order: [['createdAt', 'DESC']],
            limit: 10
          });

          const postsWithImageUrls = posts.map(post => {
            const postJson = post.toJSON();
            postJson.User.profileImageUrl = `${process.env.IMAGE_URL}/${postJson.User.profileImage}`;
            return postJson;
          });
      
    


          return{
            success:true,
            httpStatus:200,
            message:"Succesfull",
            data:postsWithImageUrls
          }


        }catch(err){
            console.log(err);

            return{
                success:false,
                httpStatus:500,
                message:"Internal Server Error"
            }
        }


    }
     getStats = async (userId) => {
     
        try {
          // Count job posts by the user
          const jobPostsCount = await JobPosting.count({
            where: {
              uid: userId // Assuming uid is the foreign key in JobPost related to Users model
            }
          });
      
          // Count bookings by the user where isCompleted = false
          const bookingsCount = await Booking.count({
            where: {
              uid: userId,
              isCompleted: false
            }
          });
      
          return {
            success: true,
            httpStatus:200,
            jobPosts: {
              count: jobPostsCount
            },
            bookings: {
              count: bookingsCount
            }
          };
        } catch (error) {
          console.error('Error fetching stats:', error);
          return {
            success: false,
            httpStatus:500,
            message: 'Failed to fetch stats'
          };
        }
      };


      getJobPostByUserId = async (req,res)=>{
        const userId = req.query.userId;


  try {
    // Fetch job postings where uid matches the given userId
    const jobPostings = await JobPosting.findAll({
      where: {
        uid: userId
      }
    });

    // If no job postings are found, send a 404 response
    if (jobPostings.length === 0) {
      return res.status(404).json({ message: 'No job postings found for this user.' });
    }

    // Send the job postings as a JSON response
    res.status(200).json(jobPostings);
  } catch (error) {
    // Handle any errors that occur
    console.error('Error fetching job postings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
      }

       addBookingRequest = async (req, res) => {
        const {
          userId,
          freelanceruid,
          jobTitle,
          description,
          date,
          time,
          location,
          latitude,
          longitude,
          payAmount,
          duration
        } = req.body;
      
        // Check for empty values
        if (!userId || !jobTitle || !description || !date || !time || !payAmount || !duration || !location || !freelanceruid) {
          return res.status(400).json({ error: 'All fields are required' });
        }
      
        try {
          // Create a new instance of BookingRequest
          const newBookingRequest = await BookingRequest.create({
            uid: userId,
            freelanceruid,
            jobTitle,
            description,
            date,
            time,
            location,
            latitude,
            longitude,
            payAmount,
            duration
          });
      
          // Send a success response
          res.status(201).json({ message: 'Booking request added successfully', bookingRequest: newBookingRequest });
        } catch (error) {
          console.error('Error adding booking request:', error);
          // Send an error response
          res.status(500).json({ error: 'Failed to add booking request' });
        }
      };



      getJobPostsByUserId = async (req,res)=>{

        const userId = req.query.userId;

        try {
          const jobPosts = await JobPosting.findAll({
            where: {
              uid: userId
            }
          });
      

      
          res.status(200).json(jobPosts);
        } catch (error) {
          console.error('Error fetching job posts:', error);
          res.status(500).json({ message: 'Internal server error' });
        }

      }



      getBookingRequestsByUserId = async (req,res)=>{
        const userId = req.query.userId;

        try {
          const bookingRequests = await BookingRequest.findAll({
            where: {
              uid: userId
            }
          });
      

      
          res.status(200).json(bookingRequests);
        } catch (error) {
          console.error('Error fetching booking requests:', error);
          res.status(500).json({ message: 'Internal server error' });
        }

        

      }


      getBookingsByUserId = async (req, res) => {
        const userId = req.query.userId;
        
        try {
            const bookings = await Booking.findAll({
                where: {
                    uid: userId,
                    isCompleted: false
                },
                include: [
                    {
                        model: User,
                        as: 'AssignedFreelancer',
                        attributes: ['uid', 'fullName', 'email', 'phoneNo', 'profileImage']
                    }
                ],
                order: [['createdAt', 'DESC']] // Order by creation date in descending order
            });
        
            const updatedBookings = bookings.map(booking => {
                const freelancer = booking.AssignedFreelancer;
                if (freelancer && freelancer.profileImage) {
                    freelancer.profileImageUrl = `${req.protocol}://${req.get('host')}/uploads/${freelancer.profileImage}`;
                }
                return booking;
            });
        
            res.status(200).json(updatedBookings);
        } catch (error) {
            console.error('Error fetching booking requests:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
    


       getProfileData = async (req, res) => {
        const uid = req.query.userId;
      
        try {
          // Fetch user data from the database
          const user = await User.findOne({
            where: { uid: uid },
          });
      
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
      
          // Send user data to frontend
          res.status(200).json(user);
        } catch (error) {
          console.error('Error fetching user data:', error);
          res.status(500).json({ error: 'Internal server error' });
        }

      }


       reviewFreelancer = async (req, res) => {
        const { uid, frid, bid, rating } = req.body;
        const comment = req.body.review;
      
        console.log(uid, frid, bid, rating, comment);
      
        // Validate input
        if (!uid || !frid || !bid || !rating) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
      
        try {
          // Check if a review for this bid already exists
          const existingReview = await Review.findOne({ where: { bid } });
      
          if (existingReview) {
            // Review already exists for this bid
            return res.status(400).json({ message: 'Review already made for this booking' });
          }
      
          // Create a new review instance
          const newReview = await Review.create({
            cid: uid, // Client ID
            frid,     // Freelancer ID
            bid,      // Booking ID
            comment,  // Comment
            rating    // Rating
          });
      
          // Return success response
          return res.status(201).json({ message: 'Review submitted successfully', review: newReview });
        } catch (error) {
          console.error('Error submitting review:', error);
          // Return error response
          return res.status(500).json({ message: 'Error submitting review. Please try again later.' });
        }
      };

       deleteJobPostingById = async (req, res) => {
        const jpid = req.query.jpid;
      
        if (!jpid) {
          return res.status(400).json({ error: 'Job Posting ID (jpid) is required' });
        }
      
        try {
          const result = await JobPosting.destroy({
            where: {
              jpid: jpid
            }
          });
      
          if (result === 0) {
            return res.status(404).json({ message: 'Job Posting not found' });
          }
      
          return res.status(200).json({ message: 'Job Posting deleted successfully' });
        } catch (error) {
          console.error('Error deleting job posting:', error);
          return res.status(500).json({ error: 'An error occurred while deleting the job posting' });
        }
      };

       getPaymentStatusByBookingId = async (req, res) => {
        const  bid  = req.query.bid; // Ensure you're getting the bid from the request body
      
        try {
          // Check if a payment already exists for the provided bid
          const existingPayment = await Payment.findOne({ where: { bid } });
      
          if (existingPayment) {
            // Payment exists, return paymentMade: true
            return res.json({ success: true, paymentMade: true });
          } else {
            // Payment does not exist, return paymentMade: false
            return res.json({ success: true, paymentMade: false });
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          res.status(500).json({ success: false, error: 'Failed to check payment status' });
        }
      };

       getAllFreelancers = async (req, res) => {
        const searchQuery  = req.query.searchQuery;
    
        try {
          const serviceQueryOptions = {
            include: [
                {
                    model: User,
                    attributes: ['uid', 'fullName', 'email', 'phoneNo', 'profileImage','isVerified'],
                }
            ],
            where: {} // Initialize `where` to an empty object
        };
    
      // If there's a search query, apply filters
if (searchQuery && searchQuery.trim() !== '') {
  serviceQueryOptions.where = {
      [Op.or]: [
          { serviceName: { [Op.like]: `%${searchQuery}%` } },
          { serviceType: { [Op.like]: `%${searchQuery}%` } },
          { description: { [Op.like]: `%${searchQuery}%` } },
          { '$User.fullName$': { [Op.like]: `%${searchQuery}%` } }
      ]
  };
}
    
            // Fetch the services based on query options
            const services = await Service.findAll(serviceQueryOptions);
            
            // Check if services were fetched
            console.log('Fetched services:', services);
    
            // Get user IDs from the fetched services
            const userIds = services.map(service => service.User.uid); // No need to convert to string
    
            // Check if userIds are fetched correctly
            console.log('User IDs:', userIds);
    
            // Fetch average ratings for these users
            const reviews = await Review.findAll({
                attributes: [
                    'frid',
                    [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
                ],
                where: {
                    frid: userIds
                },
                group: ['frid']
            });
    
            // Check if reviews are fetched correctly
            console.log('Reviews with average ratings:', reviews);
    
            // Convert reviews to a map for easy lookup
            const ratingMap = reviews.reduce((acc, review) => {
                acc[review.frid] = review.dataValues.averageRating; // Correctly access averageRating
                return acc;
            }, {});
    
            // Check the ratingMap for correctness
            console.log('Rating map:', ratingMap);
    
            // Attach average ratings to services
            const servicesWithRatings = services.map(service => {
                const userId = service.User.uid; // Use integer directly
                return {
                    ...service.toJSON(),
                    averageRating: ratingMap[userId] || 0 // Default to 0 if no rating
                };
            });
    
            // Respond with the services including average ratings
            res.status(200).json(servicesWithRatings);
        } catch (error) {
            console.error('Error fetching services:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };


    getFreelancerProfileInfo = async(req,res)=>{
      try {
        const freelancerUid = req.query.freelancerUid;
    
        if (!freelancerUid) {
          return res.status(400).json({ message: 'freelancerUid is required' });
        }
    
        const user = await User.findOne({
          where: { uid: freelancerUid },
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
    }


     getFreelancerServiceInfo = async (req, res) => {
      try {
        const freelancerUid = parseInt(req.query.freelancerUid);
    
        if (isNaN(freelancerUid)) {
          return res.status(400).json({ error: 'Invalid freelancerUid' });
        }
    
        // Fetch the service details for the given freelancerUid
        const service = await Service.findOne({
          where: {
            uid: freelancerUid
          }
        });
    
        if (!service) {
          return res.status(404).json({ error: 'Service not found for the given freelancerUid' });
        }
    
        // Fetch the average rating and total number of ratings for the given freelancerUid
        const reviewStats = await Review.findAll({
          attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
            [sequelize.fn('COUNT', sequelize.col('rating')), 'totalRatings']
          ],
          where: {
            frid: freelancerUid
          }
        });
    
        const stats = reviewStats[0] || {};
        const averageRating = stats.dataValues.averageRating || 0;
        const totalRatings = stats.dataValues.totalRatings || 0;
    
        res.json({
          service,
          averageRating,
          totalRatings
        });
      } catch (error) {
        console.error('Error fetching service info:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };


     getFreelancerProjectsInfo = async (req, res) => {
      const freelancerUid  = req.query.freelancerUid;
    
      if (!freelancerUid) {
        return res.status(400).json({ error: 'freelancerUid query parameter is required' });
      }
    
      try {
        const bookings = await Booking.findAll({
          where: { freelanceruid: freelancerUid },
          include: [
            {
              model: Review,
              as: 'Reviews',
              attributes: ['comment', 'rating'] // Specify which review fields you want to include
            }
          ],
          attributes: [
            'bid',
            'jobTitle',
            'description',
            'date',
            'time',
            'location',
            'latitude',
            'longitude',
            'payAmount',
            'duration',
            'isCompleted'
          ]
        });
    
        // Check if any bookings are found
        if (bookings.length === 0) {
          return res.status(200).json({});
        }
    
        res.json(bookings);
      } catch (error) {
        console.error('Error fetching freelancer projects info:', error);
        res.status(500).json({ error: 'An error occurred while fetching freelancer projects info' });
      }
    };


  //   recommendFreelancers = async (req, res) => {
  //     try {
  //         // Parse the JSON string from req.query.savedData
  //         const savedData = JSON.parse(req.query.savedData);
  
  //         // Access individual keys
  //         const { jobTitle, description, date, time, serviceType, location, coordinates, proposedPayAmount, durationNumber, durationUnit } = savedData;
  
  //         // Create a new instance of Jobs model
  //         const newJob = await Jobs.create({
  //             jobTitle,
  //             description,
  //             date,
  //             time,
  //             serviceType,
  //             location,
  //             latitude: coordinates.lat,
  //             longitude: coordinates.lng,
  //             proposedPayAmount,
  //             duration: `${durationNumber} ${durationUnit}`
  //         });
  
  //         const jobId = newJob.job_id;
  //         const flaskApiUrl = `http://localhost:8000/recommendations/${jobId}?location=${encodeURIComponent(location)}&serviceType=${encodeURIComponent(serviceType)}`;
  
  //         try {
  //             const response = await axios.get(flaskApiUrl);
  //             // Handle the response from the Flask API
  //             const recommendedContractors = response.data.recommended_contractors;
  
  //             // Store the recommended contractors' IDs in a separate variable
  //             const contractorIds = recommendedContractors.length ? recommendedContractors : [];
  
  //             if (contractorIds.length > 0) {
  //                 // Fetch Service data along with related User data, average rating, and review count
  //                 const services = await Service.findAll({
  //                     where: {
  //                         sid: contractorIds
  //                     },
  //                     include: [{
  //                         model: User,
  //                         attributes: [
  //                             'uid', 'fullName', 'email', 'profileImage', 'phoneNo', 'location',
  //                             [literal('(SELECT AVG(rating) FROM Reviews WHERE Reviews.frid = User.uid)'), 'averageRating'],
  //                             [literal('(SELECT COUNT(*) FROM Reviews WHERE Reviews.frid = User.uid)'), 'reviewCount']
  //                         ]
  //                     }]
  //                 });
  
  //                 // Process and format the result as needed
  //                 const serviceDetails = services.map(service => ({
  //                     serviceId: service.sid,
  //                     serviceName: service.serviceName,
  //                     serviceType: service.serviceType,
  //                     description: service.description,
  //                     rate: service.rate,
  //                     isAvailable: service.isAvailable,
  //                     location: service.location,
  //                     latitude: service.latitude,
  //                     longitude: service.longitude,
  //                     user: {
  //                         uid: service.User.uid,
  //                         fullName: service.User.fullName,
  //                         email: service.User.email,
  //                         profileImage: service.User.profileImage,
  //                         phoneNo: service.User.phoneNo,
  //                         location: service.User.location,
  //                         averageRating: service.User.dataValues.averageRating,
  //                         reviewCount: service.User.dataValues.reviewCount
  //                     }
  //                 }));
  
  //                 console.log(serviceDetails);
  //                 res.json(serviceDetails);  // Send the data as JSON response
  
  //             } else {
  //                 console.log("No recommended contractors found.");
  //                 res.json([]);  // Send an empty array as response
  //             }
  
  //         } catch (error) {
  //             console.error("Error fetching recommendations:", error.response ? error.response.data : error.message);
  //             res.status(500).json({ error: "Error fetching recommendations" });
  //         }
  //     } catch (error) {
  //         console.error("Error parsing savedData or creating job:", error.message);
  //         res.status(500).json({ error: "Error parsing savedData or creating job" });
  //     }
  // };
  

   recommendFreelancers = async (req, res) => {
    try {
      // Parse the JSON string from req.query.savedData
      const savedData = JSON.parse(req.query.savedData);
  
      // Access individual keys
      const { jobTitle, description, date, time, serviceType, location, coordinates, proposedPayAmount, durationNumber, durationUnit } = savedData;
  
      // Create a new instance of Jobs model
      const newJob = await Jobs.create({
        jobTitle,
        description,
        date,
        time,
        serviceType,
        location,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        proposedPayAmount,
        duration: `${durationNumber} ${durationUnit}`
      });
  
      const jobId = newJob.job_id;
      const flaskApiUrl = `http://localhost:8000/recommendations/${jobId}?location=${encodeURIComponent(location)}&serviceType=${encodeURIComponent(serviceType)}`;
  
      try {
        const response = await axios.get(flaskApiUrl);
        // Handle the response from the Flask API
        const recommendedContractors = response.data.recommended_contractors;
  
        // Store the recommended contractors' IDs in a separate variable
        const contractorIds = recommendedContractors.length ? recommendedContractors : [];
  
        if (contractorIds.length > 0) {
          // Fetch Service data along with related User data, average rating, and review count
          const services = await Service.findAll({
            where: {
              sid: contractorIds
            },
            include: [{
              model: User,
              attributes: [
                'uid', 'fullName', 'email', 'profileImage', 'phoneNo', 'location',
                [literal('(SELECT AVG(rating) FROM Reviews WHERE Reviews.frid = User.uid)'), 'averageRating'],
                [literal('(SELECT COUNT(*) FROM Reviews WHERE Reviews.frid = User.uid)'), 'reviewCount']
              ]
            }]
          });
  
          // Process and format the result as needed
          const serviceDetails = services.map(service => ({
            serviceId: service.sid,
            serviceName: service.serviceName,
            serviceType: service.serviceType,
            description: service.description,
            rate: service.rate,
            isAvailable: service.isAvailable,
            location: service.location,
            latitude: service.latitude,
            longitude: service.longitude,
            user: {
              uid: service.User.uid,
              fullName: service.User.fullName,
              email: service.User.email,
              profileImage: service.User.profileImage,
              phoneNo: service.User.phoneNo,
              location: service.User.location,
              averageRating: service.User.dataValues.averageRating,
              reviewCount: service.User.dataValues.reviewCount
            }
          }));
  
          // Reverse the order of serviceDetails
          const reversedServiceDetails = serviceDetails.reverse();
  
          console.log(reversedServiceDetails);
          res.json(reversedServiceDetails);  // Send the data as JSON response
  
        } else {
          console.log("No recommended contractors found.");
          res.json([]);  // Send an empty array as response
        }
  
      } catch (error) {
        console.error("Error fetching recommendations:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Error fetching recommendations" });
      }
    } catch (error) {
      console.error("Error parsing savedData or creating job:", error.message);
      res.status(500).json({ error: "Error parsing savedData or creating job" });
    }
  };
  
      


      

}






export default ClientController;

