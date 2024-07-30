import ProfileVerification from "../models/profileVerificationModel.js";


const checkExistingDocuments = async (req, res, next) => {
    const uid = req.userId;

    try {
        const existingDocuments = await ProfileVerification.findOne({
            where: { uid } // Correct use of where clause
        });

        if (existingDocuments) {
            res.status(409).json({ message: "Process Failed. You documents have already been submitted for verification. Please wait until you get a response on your e-mail." });
        } else {
            next(); // Proceed to the next middleware or route handler
        }
    } catch (error) {
        console.error('Error checking existing documents:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


  export default checkExistingDocuments;