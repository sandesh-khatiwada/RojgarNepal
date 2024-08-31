import React, { useEffect } from 'react';
import './../css/pageCss/circlecheck.css';

const Circlecheck = ({ data }) => {

  useEffect(() => {
    const outerCircle = document.querySelector('.outer-circle');
    const innerCircle = document.querySelector('.inner-circle');
    const innermostCircle = document.querySelector('.innermost-circle');
    outerCircle.classList.add('animate');
    innerCircle.classList.add('animate');
    innermostCircle.classList.add('animate');
  }, []);

  return (
    <div className="doughnut-chart-container">
      <div className="doughnut-chart">
        <div className="outer-circle half-circle"></div>
        <div className="inner-circle half-circle"></div>
        <div className="innermost-circle"></div>
        <div className="data-display">
          {data}
        </div>
      </div>
    </div>
  );
};

export default Circlecheck;
