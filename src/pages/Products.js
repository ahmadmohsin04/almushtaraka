import './Products.css';

function Products() {
  return (
    <div className="page">
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Browse our catalog of premium industrial machinery and equipment.</p>
      </div>
      <div className="products-coming-soon">
        <div className="coming-soon-icon">⚙️</div>
        <h2>CATALOG COMING SOON</h2>
        <p>We are currently updating our product catalog with the latest machinery and equipment. Check back soon or contact us directly for inquiries.</p>
        <div className="coming-soon-divider"></div>
        <p className="coming-soon-contact">📍 Dibba Industrial Area, UAE &nbsp;|&nbsp; 👤 Arif Mukhtar Malik</p>
      </div>
    </div>
  );
}

export default Products;