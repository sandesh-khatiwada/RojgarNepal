import React from "react";
import ServiceBox from "./../component/ServiceBox.jsx";
import Button from "./../component/Button.jsx";
import "./../css/pageCss/Home.css";
import Navbar from './../component/Navbar.jsx';
import Footer from './../component/Footer.jsx';
import image from "./../images/home.png";
import image1 from "./../images/search.png";
import electrician from "./../images/electrician.png"
import plumber from "./../images/plumber.png"
import painter from "./../images/painter.png"
import cleaner from "./../images/cleaner.png"
import dishwasher from "./../images/dishwasher.png"
import laundry from "./../images/laundry.png"
import carpenter from "./../images/carpenter.png"
import technician from "./../images/technician.png"
import selroti from "./../images/selroti.png"
import tuitionteacher from "./../images/tuitionteacher.png"
import sweeper from "./../images/sweeper.png"
import repairman from "./../images/repairman.png"
import gardener from "./../images/gardener.png"
import pandit from "./../images/pandit.png"
import caretaker from "./../images/caretaker.png"












const services = [
  { title: "Electrician", image: electrician, description: "Electrical Services" },
  { title: "Plumber", image: plumber },
  { title: "Painter", image: painter },
  { title: "Cleaner", image: cleaner },
  { title: "Dish-Washer", image: dishwasher },
  { title: "Laundry", image: laundry },
  { title: "Carpenter", image: carpenter },
  { title: "Technician", image: technician },
  { title: "Selroti Maker", image: selroti },
  { title: "Tuition Teacher", image: tuitionteacher },
  { title: "Sweeper", image: sweeper },
  { title: "Repair-man", image: repairman },
  { title: "Gardener", image: gardener },
  { title: "Pandits", image: pandit },
  { title: "Care Taker", image: caretaker },
];

const Home = () => {
  return (
    <>
    <Navbar/>
      <div className="home-container">
        <div className="home">
          <h1>
            Find <span className="highlight">Freelancers</span> Near You
            <br />
            And Get Your Job Done
          </h1>
          <br></br>
          {/* <div className="search-container">
            <button className="filter-button">Search</button>
            <input
              type="text"
              className="search-input"
              placeholder="Search what you want . . ."
            />
            <button className="search-button">
              <img src={image1} alt="Search" />
            </button>
          </div> */}
          <br></br>
          <br></br>

          <div className="suggestions">
            <p>You may be looking for :</p>
            <br></br>
            <div className="suggestion-tags">
              <span className="tag">Selroti Maker</span>
              <span className="tag">Electrician</span>
              <span className="tag">Panche Baja</span>
              <span className="tag">Laundry Service</span>
              <span className="tag">Gardener</span>
              <span className="tag">Plumber</span>
              <span className="tag">Caretaker</span>
              <span className="tag">Technician</span>
              <span className="tag">Pandits</span>
              <span className="tag">Tuition Teacher</span>



            </div>
          </div>
        </div>
        <div className="home-image">
          <img src={image} alt="RojgarNepal" />
        </div>
      </div>
      <div className="main-page">
        <h1>
          Browse <span className="highlight">Talent</span> By Category
        </h1>
        <p>Get some inspiration from 10+ skills</p>
        <div className="services-container">
          {services.map((service, index) => (
            <ServiceBox
              key={index}
              title={service.title}
              image={service.image}
              // description={service.description}
            />
          ))}
        </div>
      
      </div>

   <Footer/>
    </>
  );
};

export default Home;
