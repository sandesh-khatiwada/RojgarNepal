import express from "express";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import FreelancerController from "../controllers/freelancerController.js";
import upload from "../config/documents.js";
import checkExistingDocuments from "../middlewares/checkExistingDocuments.js";

const router = express.Router();
const freelancerController = new FreelancerController();



router.get("/dashboard",authenticate,authorize(['Freelancer']),(req,res)=>{
    res.send("Freelancer Dashboard")
})

router.get("/stats",authenticate,authorize(['Freelancer']),async (req,res)=>{

    const userId = req.query.userId;
    const response = await freelancerController.getStats(userId);


    if(response.httpStatus==200){
        return res.status(response.httpStatus).json({success:response.success,activeProjects:response.activeProjects,completedProjects:response.completedProjects,isVerified:response.isVerified});
    }else{
        return res.status(response.httpStatus).json({success:response.success,message:response.message});
    }

})

router.get("/recent-jobs",authenticate,authorize(['Freelancer']),async(req,res)=>{
        const response = await freelancerController.getRecentJobs();

        if(response.httpStatus==200){
            return res.status(response.httpStatus).json({success:response.success,data:response.data});
        }else{
            return res.status(reponse.httpStatus).json({success:response.success,message:response.message});
        }
})

router.post("/job-application",authenticate,authorize(['Freelancer']),async (req,res)=>{

    const response = await freelancerController.sendMail(req.body);


    return res.status(response.httpStatus).json({success:response.success,message:response.message});
   
});


router.get("/profile",freelancerController.getProfileData);

router.get("/bookings",authenticate,authorize(['Freelancer']),freelancerController.getBookingsByFreelanceruid);

router.get("/booking-requests",authenticate,authorize(['Freelancer']),freelancerController.getBookingRequestsByFreelanceruid);

router.get("/job-posts",authenticate,authorize(['Freelancer'],freelancerController.getJobPost));

router.post("/booking",authenticate,authorize(["Freelancer"]), freelancerController.insertBooking);

router.delete("/booking-request",authenticate,authorize(["Freelancer"]), freelancerController.deleteBookingRequest);

router.get("/client-information",authenticate,authorize(["Freelancer"]),freelancerController.getClientInformationFromBookingId);

router.get("/payment-info",authenticate,authorize(["Freelancer"]),freelancerController.getPaymentInfoFromBookingId);

router.get("/review-info",authenticate,authorize(["Freelancer"]),freelancerController.getReviewFromBookingId);

router.post("/profile-verification",authenticate,authorize(["Freelancer"]),checkExistingDocuments, upload.fields([
    { name: 'identity-doc', maxCount: 1 },
    { name: 'work-doc1', maxCount: 1 },
    { name: 'work-doc2', maxCount: 1 }
  ]),freelancerController.addProfileVerificationDocuments);



  router.get("/job-posts",authenticate,authorize(["Freelancer"]),freelancerController.getAllJobPosts);




  router.get("/client-profile-info",freelancerController.getClientProfileInfo);
  router.get("/client-profile-jobposts",freelancerController.getClientProfileJobPosts);








export default router;