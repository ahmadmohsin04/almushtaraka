import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-main">AL MUSHTARAKA</span>
          <span className="brand-sub">TRADING COMPANY</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" className={location.pathname === '/products' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Products</Link>
          <Link to="/agreement" className={`nav-cta ${location.pathname === '/agreement' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Create Agreement</Link>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;