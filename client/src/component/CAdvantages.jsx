import React from 'react';
import './../css/componentCss/CAdvantages.css';

const CAdvantages = () => {
  const advantages = [
    { title: "Trusted Professionals", icon: "👨‍💼" },
    { title: "Quick Matches", icon: "⚡" },
    { title: "Secure Payment", icon: "🔒" },
    { title: "Top Review", icon: "⭐" },
  ];

  return (
    <section className="advantages">
      <h2 className='advantages-title'>What Sets Us Apart?</h2>
      <p className='advantages-subtitle'>Unmatched advantages that make us stand out</p>
      <div className="advantage-cards">
        {advantages.map((adv, index) => (
          <div key={index} className="advantage-card">
            <div className="icon">{adv.icon}</div>
            <h3 className='advantages-content'>{adv.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CAdvantages;
