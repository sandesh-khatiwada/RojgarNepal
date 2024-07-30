import express from "express";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import ClientController from "../controllers/clientController.js";

const router = express.Router();
const clientController = new ClientController();


router.get("/dashboard",authenticate,authorize(['Client']),(req,res)=>{
    res.send("Client Dashboard")
})

router.post("/post-job",authenticate,authorize(['Client']),async (req,res)=>{
    // const {uid,description,date,time,serviceType,location,latitude,longitude}= req.body;

    const response = await clientController.postJob(req.body);

    if(!response.success){
     return res.status(response.httpStatus).json({
            success:response.success,
            message:response.message
        })
    }else{
        return res.status(response.httpStatus).json({
            success:response.success,
            message:response.message,
            postData:response.data
        })
    }

    
})


router.get("/recent-jobs",authenticate,authorize(['Client']),async (req,res)=>{

    const response = await clientController.getTredingJobPostings();

    if(!response.success){
            return res.status(response.httpStatus).json({
                success:response.success,
                message:response.message
            });
    }

    return res.status(response.httpStatus).json({
        success:response.success,
        message:response.message,
        recentJobs:response.data
    })
    
})


router.get("/stats",async (req,res)=>{
    const userId=req.query.userId;
    

    const response = await clientController.getStats(userId);

    if(response.httpStatus==200){
        return res.status(response.httpStatus).json({success:response.success,data:{jobPosts:response.jobPosts,bookings:response.bookings}});
    }else{
       return res.status(response.httpStatus).json({success:response.success,message:response.message});
    }

})


router.get("/jobpost-data",authenticate,authorize(['Client']),clientController.getJobPostByUserId);

router.get("/profile",authenticate,authorize(['Client']),clientController.getProfileData);


router.post("/booking-request",authenticate,authorize(['Client']),clientController.addBookingRequest);


router.get("/bookings",authenticate,authorize(['Client']),clientController.getBookingsByUserId);

router.get("/booking-requests",authenticate,authorize(['Client']),clientController.getBookingRequestsByUserId);

router.get("/job-posts",authenticate,authorize(['Client']),clientController.getJobPostsByUserId);

router.post("/review",authenticate,authorize(['Client']),clientController.reviewFreelancer);

router.delete("/jobposting",authenticate,authorize(['Client']),clientController.deleteJobPostingById);


router.get("/payment-status",authenticate,authorize(['Client']),clientController.getPaymentStatusByBookingId);

router.get("/tallents",clientController.getAllFreelancers);


router.get("/freelancer-profile-info",clientController.getFreelancerProfileInfo);

router.get("/freelancer-service-info",clientController.getFreelancerServiceInfo);

router.get("/freelancer-projects-info",clientController.getFreelancerProjectsInfo);

router.get('/freelancer-recommendation',clientController.recommendFreelancers);









export default router;