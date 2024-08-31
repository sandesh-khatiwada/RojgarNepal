import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  BrowserRouter,
} from "react-router-dom";



import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminJobPosts from "./pages/AdminJobPosts.jsx";
import AdminVerifyUser from "./pages/AdminVerifyUser.jsx";
import AdminUserStatistics from "./pages/AdminUserStatistics.jsx";
import AdminLogIn from "./pages/AdminLogin.jsx"




const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<AdminLogIn />} />
        <Route path="/admin" element={<AdminLogIn />} />

        <Route path="/adminlogin" element={<AdminLogIn />} />
        <Route path="/admin-user" element={<AdminUserStatistics />} />
        <Route path="/admin-jobPosts" element={<AdminJobPosts />} />
        <Route path="/admin-booking" element={<AdminDashboard/>} />
        <Route path="/admin-verifyUser" element={<AdminVerifyUser/>} />


      </Routes>

    </BrowserRouter>
  );
};

export default App;
