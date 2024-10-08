import jwt from 'jsonwebtoken';

const adminAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, authorized: false, message: 'Unauthorized admin: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, authorized: false, message: 'Unauthorized admin: Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    // Check for specific JWT errors and respond with a proper message
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, authorized:false, message: 'Invalid or malformed token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, authorized:false, message: 'Token has expired' });
    } else {
      return res.status(500).json({ success: false,authorized:false, message: 'Internal server error' });
    }
  }
};

export default adminAuthenticate;



