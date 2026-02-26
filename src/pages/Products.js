import './Products.css';

const products = [
  {
    id: 1,
    name: "Product One",
    description: "High quality product with great features.",
    price: "1,500 AED",
    image: "https://via.placeholder.com/300x200?text=Product+1"
  },
  {
    id: 2,
    name: "Product Two",
    description: "Durable and reliable for everyday use.",
    price: "2,200 AED",
    image: "https://via.placeholder.com/300x200?text=Product+2"
  },
  {
    id: 3,
    name: "Product Three",
    description: "Premium quality at an affordable price.",
    price: "3,800 AED",
    image: "https://via.placeholder.com/300x200?text=Product+3"
  },
  {
    id: 4,
    name: "Product Four",
    description: "Best seller with excellent customer reviews.",
    price: "5,000 AED",
    image: "https://via.placeholder.com/300x200?text=Product+4"
  },
  {
    id: 5,
    name: "Product Five",
    description: "Compact and efficient for modern needs.",
    price: "1,200 AED",
    image: "https://via.placeholder.com/300x200?text=Product+5"
  },
  {
    id: 6,
    name: "Product Six",
    description: "Latest model with advanced specifications.",
    price: "4,500 AED",
    image: "https://via.placeholder.com/300x200?text=Product+6"
  },
];

function Products() {
  return (
    <div className="page">
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Browse our catalog and find the right product for you.</p>
      </div>
      <div className="products-grid">
        {products.map(product => (
          <div className="product-card" key={product.id}>
            <img src={product.image} alt={product.name} />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-footer">
                <span className="product-price">{product.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;