import { Link } from 'react-router';
import { Product } from '../lib/mock-data';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.slug}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300">
        <div className="aspect-square overflow-hidden bg-muted">
          <ImageWithFallback
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium mb-1 group-hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-muted-foreground">
              Stok: {product.stock}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
