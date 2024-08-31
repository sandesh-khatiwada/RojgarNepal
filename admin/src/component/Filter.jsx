import React from 'react'
import './../css/componentCss/Filter.css';

const Filter = () => {
  return (
    <div className="adminfilter">
    <label>From:</label>
    <input type="date" />
    <label>To:</label>
    <input type="date" />
    <button className="adminfilter-button">Filter</button>
  </div>
  )
}

export default Filter