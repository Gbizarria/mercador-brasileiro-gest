
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

export const EmptyCart = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Carrinho de Compras</h1>
      </div>
      
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
          <Button asChild>
            <a href="/produtos/catalogo">Continuar Comprando</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
