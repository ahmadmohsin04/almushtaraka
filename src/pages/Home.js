import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const stats = [
    { number: '500+', label: 'Machines Sold' },
    { number: '10+', label: 'Years Experience' },
    { number: '200+', label: 'Happy Clients' },
    { number: 'UAE', label: 'Based & Trusted' },
  ];

  const services = [
    {
      icon: '⚙️',
      title: 'Industrial Machinery',
      desc: 'Premium lathe machines, drill presses, and heavy industrial equipment sourced from top manufacturers.'
    },
    {
      icon: '📄',
      title: 'Transparent Agreements',
      desc: 'Generate professional sales and lease agreements instantly with full payment schedules.'
    },
    {
      icon: '💳',
      title: 'Flexible Payment Plans',
      desc: 'Customized installment plans tailored to your business needs with clear monthly schedules.'
    },
    {
      icon: '✅',
      title: 'Verified & Trusted',
      desc: 'Every transaction backed by a formal signed agreement, protecting both buyer and seller.'
    },
  ];

  return (
    <div className="home">

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-pattern"></div>
        <div className="hero-content">
          <div className="hero-tag">DIBBA INDUSTRIAL AREA, UAE</div>
          <h1 className="hero-title">
            INDUSTRIAL<br />
            <span className="hero-title-accent">MACHINERY</span><br />
            & TRADING
          </h1>
          <p className="hero-desc">
            Al Mushtaraka Trading Company supplies premium industrial machinery and equipment across the UAE with professional sales agreements and flexible payment solutions.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn-primary">View Products</Link>
            <Link to="/agreement" className="btn-outline">Create Agreement</Link>
          </div>
        </div>
        <div className="hero-stats">
          {stats.map((s, i) => (
            <div className="stat-item" key={i}>
              <span className="stat-number">{s.number}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider">
        <span>WHAT WE OFFER</span>
      </div>

      {/* Services */}
      <section className="services">
        <div className="services-grid">
          {services.map((s, i) => (
            <div className="service-card" key={i}>
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>READY TO CREATE AN AGREEMENT?</h2>
          <p>Generate a professional sales or lease agreement in minutes.</p>
          <Link to="/agreement" className="btn-primary">Get Started →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-main">AL MUSHTARAKA</span>
            <span className="brand-sub">TRADING COMPANY</span>
          </div>
          <div className="footer-info">
            <p>📍 Dibba Industrial Area, UAE</p>
            <p>👤 Arif Mukhtar Malik — Partner & Manager</p>
          </div>
          <div className="footer-copy">
            <p>© {new Date().getFullYear()} Al Mushtaraka Trading Company. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Home;