import React from 'react';
import './Card.css';

/**
 * Reusable card component for dashboard widgets
 */
function Card({ title, subtitle, children, className = '', onClick, variant = 'default' }) {
  const cardClass = `card card--${variant} ${onClick ? 'card--clickable' : ''} ${className}`;

  return (
    <div className={cardClass} onClick={onClick}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}

export default Card;
