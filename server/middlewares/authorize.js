
//This middleware manages access control based on userType
//For example: Client should not be allowed to access Freelancer dashboard and vice versa

const authorize = (allowedUserType) => (req, res, next) => {
    if (!allowedUserType.includes(req.userType)) {
      return res.status(403).json({ success: false, authorized:false, message: 'Forbidden: You do not have access to this resource' });
    }
    next();
  };



  export default authorize;

