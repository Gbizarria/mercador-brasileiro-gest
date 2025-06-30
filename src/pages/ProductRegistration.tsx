
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

const ProductRegistration = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simular salvamento - em produção, usar Supabase
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const newProduct = {
        id: Date.now().toString(),
        name,
        description,
        price: parseFloat(price),
        createdAt: new Date().toISOString(),
      };

      products.push(newProduct);
      localStorage.setItem('products', JSON.stringify(products));

      toast({
        title: "Produto cadastrado com sucesso!",
        description: `${name} foi adicionado ao catálogo.`,
      });

      // Limpar formulário
      setName('');
      setDescription('');
      setPrice('');
    } catch (error) {
      toast({
        title: "Erro ao cadastrar produto",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cadastrar Produto</h1>
        <p className="text-gray-600">Adicione novos produtos ao seu catálogo</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Novo Produto
          </CardTitle>
          <CardDescription>
            Preencha as informações do produto que deseja cadastrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite o nome do produto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o produto detalhadamente"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Produto'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de produtos cadastrados recentemente */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Cadastrados Recentemente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Os produtos cadastrados aparecerão aqui. Para visualizar todos os produtos, acesse o{' '}
            <a href="/produtos/catalogo" className="text-primary hover:underline">
              catálogo completo
            </a>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductRegistration;
