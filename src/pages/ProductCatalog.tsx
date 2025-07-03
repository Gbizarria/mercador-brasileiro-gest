
import { useState, useEffect } from 'react';
import { useCart, Product } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Search, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar os produtos. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      const formattedProducts: Product[] = data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: parseFloat(product.price.toString())
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          maxLength={100}
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

      {products.length === 0 && !isLoading && (
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
