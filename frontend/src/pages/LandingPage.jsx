import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="hero">
      <div className="hero-bg"></div>
      <h1 className="hero-title animate-fade-in-up">Rent Your Style</h1>
      <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        Premium furniture and appliances on rent. Fast delivery, flexible plans, and top-tier quality for your home.
      </p>
      <Link to="/products" className="btn-primary animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        Explore Products
      </Link>
    </div>
  );
}
