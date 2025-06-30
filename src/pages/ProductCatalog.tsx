
import { useState, useEffect } from 'react';
import { useCart, Product } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Search, ShoppingCart } from 'lucide-react';

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    // Carregar produtos do localStorage - em produção, usar Supabase
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Adicionar alguns produtos de exemplo se não houver nenhum
    if (savedProducts.length === 0) {
      const exampleProducts = [
        {
          id: '1',
          name: 'Notebook Dell Inspiron',
          description: 'Notebook Dell com 8GB RAM, SSD 256GB, Intel i5',
          price: 2599.99
        },
        {
          id: '2',
          name: 'Mouse Wireless Logitech',
          description: 'Mouse sem fio com tecnologia avançada',
          price: 89.90
        },
        {
          id: '3',
          name: 'Teclado Mecânico RGB',
          description: 'Teclado mecânico com iluminação RGB personalizável',
          price: 299.99
        },
        {
          id: '4',
          name: 'Monitor 24" Full HD',
          description: 'Monitor LED 24 polegadas com resolução Full HD',
          price: 699.99
        }
      ];
      setProducts(exampleProducts);
      localStorage.setItem('products', JSON.stringify(exampleProducts));
    } else {
      setProducts(savedProducts);
    }
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "Produto adicionado ao carrinho!",
      description: `${product.name} foi adicionado com sucesso.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de Produtos</h1>
        <p className="text-gray-600">Selecione os produtos desejados e adicione ao carrinho</p>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Pesquisar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid de produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription className="line-clamp-3">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </div>
                <Button
                  onClick={() => handleAddToCart(product)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum produto encontrado para "{searchTerm}"</p>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Nenhum produto cadastrado ainda.{' '}
            <a href="/produtos/cadastrar" className="text-primary hover:underline">
              Cadastre o primeiro produto
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
