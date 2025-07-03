
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ProductRegistration = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'admin') {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem cadastrar produtos.",
        variant: "destructive",
      });
      return;
    }

    // Input validation
    if (name.length > 255) {
      toast({
        title: "Nome muito longo",
        description: "O nome do produto deve ter no máximo 255 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (description && description.length > 1000) {
      toast({
        title: "Descrição muito longa",
        description: "A descrição deve ter no máximo 1000 caracteres.",
        variant: "destructive",
      });
      return;
    }

    const priceValue = parseFloat(price);
    const stockValue = parseInt(stockQuantity) || 0;

    if (priceValue <= 0) {
      toast({
        title: "Preço inválido",
        description: "O preço deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (stockValue < 0) {
      toast({
        title: "Estoque inválido",
        description: "A quantidade em estoque não pode ser negativa.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          price: priceValue,
          category: category.trim() || null,
          stock_quantity: stockValue,
          is_active: true
        });

      if (error) {
        console.error('Error creating product:', error);
        toast({
          title: "Erro ao cadastrar produto",
          description: "Ocorreu um erro interno. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Produto cadastrado com sucesso!",
        description: `${name} foi adicionado ao catálogo.`,
      });

      // Limpar formulário
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setStockQuantity('');
    } catch (error) {
      console.error('Error creating product:', error);
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
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite o nome do produto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
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
                maxLength={1000}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Quantidade em Estoque</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                type="text"
                placeholder="Ex: Eletrônicos, Acessórios, etc."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                maxLength={100}
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

      <Card>
        <CardHeader>
          <CardTitle>Produtos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Para visualizar todos os produtos cadastrados, acesse o{' '}
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
