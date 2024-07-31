import './../css/componentCss/Footer.css';
import React from 'react';

// Do "npm install @fortawesome/fontawesome-free" to get these icons

import "../../node_modules/@fortawesome/fontawesome-free/css/all.css";



const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-section">
                    <h2>RojgarNepal</h2>
                </div>
                <div className="footer-section">
                    <h2>Quick Links</h2>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Services</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h2>Contact Us:</h2>
                    <p><i className="fas fa-phone"></i> +977-9856412874</p>
                </div>
                <div className="footer-section">
                    <h2>Follow Us On:</h2>
                    <div className="social-icons">
                        <a href="https://www.facebook.com/login" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
                        <a href="https://www.linkedin.com/login" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
                        <a href="https://www.instagram.com/accounts/login" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024-RojgarNepal</p>
            </div>
        </footer>
    );
}

export default Footer;
