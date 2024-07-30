import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import AuthController from "./authController.js";

const authController = new AuthController();



class UserController{

  
    createUser = async (fullName,email,password,profileImage,phoneNo,location,userType)=>{

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
          fullName,
          email,
          password: hashedPassword,
          profileImage,
          phoneNo,
          location,
          userType
        });
  
        // Redirect based on user type


    
        return{success:true,uid:user.uid,email:user.email,fullName:user.fullName,userType:user.userType,message:"OTP verified and User Created Succesfully"};

      } catch (error) {
        console.error(error);

        return{success:false,message:"Internal Server Error"};
      }

    }


    insertImageName = async (email,imageName,userType)=>{


      try {
        const [updated] = await User.update(
          { profileImage: imageName },
          { where: { email: email ,userType:userType} }
        );
    
        if (updated) {
          console.log('Image name updated successfully');
          return { success: true, message: 'Image uploaded succesfully' };
        } else {
          console.log('User not found');
          return { success: false, message: 'Could not upload image' };
        }
      } catch (error) {
        console.error('Error updating image name:', error);
        return { success: false, message: 'Error updating image', error: error.message };
      }

    }


    logInUser = async(req,res)=>{
      const { email, password , userType } = req.body;


      if(!email || !password || !userType){
        return res.status(401).json({success:false,message:"Please enter all the fields to Log In"});
      }
    
      try {
        const user = await User.findOne({ where: { email ,userType} });
        if (!user) {
          return  res.status(401).json({ success:false,message: 'Invalid email' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return  res.status(401).json({success:false, message: 'Invalid password' });
        }


        const token = await authController.attachToken(user.uid,user.userType);
        // const payload = {
        //   userId:user.uid,
        //   userType:user.userType
        // }
       
        // const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        
        return res.json({ success:true,token:token,userId:user.uid,email:user.email,fullName:user.fullName,userType:user.userType});
      } catch (error) {
        console.error(error);
       return  res.status(500).json({ success:false,message: 'Internal Server Error' });
      }
    }


}


export default UserController;