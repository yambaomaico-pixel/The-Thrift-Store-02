import { Link } from 'react-router-dom';
import Button from './ui/Button';

const ProductCard = ({ product }) => {
  return (
    <div className="card flex flex-col h-full">
      <Link to={`/product/${product.id}`} style={{ display: 'block', position: 'relative', paddingTop: '133%', overflow: 'hidden' }}>
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'} 
          alt={product.name}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Link>
      <div className="flex flex-col flex-1" style={{ padding: 'var(--spacing-4)' }}>
        <div className="flex justify-between items-start mb-2">
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0 }}>
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <span style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>${product.price?.toFixed(2)}</span>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)', flex: 1 }}>
          {product.brand} &bull; {product.condition}
        </p>
        <Button variant="primary" className="w-full">Add to Cart</Button>
      </div>
    </div>
  );
};

export default ProductCard;
