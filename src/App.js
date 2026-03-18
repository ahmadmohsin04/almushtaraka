import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Agreement from './pages/Agreement';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import Customers from './pages/Customers';
import SignAgreement from './pages/SignAgreement';
import { useLocation } from 'react-router-dom';
import './App.css';

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/sign/');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={hideNavbar ? '' : 'content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/agreement" element={<Agreement />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sign/:token" element={<SignAgreement />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;