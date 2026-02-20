import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1>Welcome to Al Mushtaraka</h1>
          <p>Your trusted partner for quality products and transparent sales agreements.</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-primary">View Products</Link>
            <Link to="/agreement" className="btn-secondary">Create Agreement</Link>
          </div>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">🛒</div>
          <h3>Quality Products</h3>
          <p>Browse our catalog of carefully selected products at competitive prices.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📄</div>
          <h3>Sales Agreements</h3>
          <p>Generate professional sales agreements instantly with your details.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">✍️</div>
          <h3>E-Signature</h3>
          <p>Sign your agreement digitally and save a copy for your records.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h3>Payment Plans</h3>
          <p>Flexible payment schedules tailored to your needs.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;