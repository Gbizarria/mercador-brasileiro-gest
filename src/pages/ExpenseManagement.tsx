
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        toast({
          title: "Erro ao carregar despesas",
          description: "Não foi possível carregar as despesas.",
          variant: "destructive",
        });
        return;
      }

      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Erro ao carregar despesas",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'admin') {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem gerenciar despesas.",
        variant: "destructive",
      });
      return;
    }

    // Input validation
    if (description.length > 500) {
      toast({
        title: "Descrição muito longa",
        description: "A descrição deve ter no máximo 500 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (category.length > 100) {
      toast({
        title: "Categoria muito longa",
        description: "A categoria deve ter no máximo 100 caracteres.",
        variant: "destructive",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (amountValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          description: description.trim(),
          amount: amountValue,
          category: category.trim(),
          date: date,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        toast({
          title: "Erro ao cadastrar despesa",
          description: "Não foi possível cadastrar a despesa.",
          variant: "destructive",
        });
        return;
      }

      // Add to local state
      setExpenses(prev => [data, ...prev]);

      toast({
        title: "Despesa cadastrada com sucesso!",
        description: `Despesa de R$ ${amountValue.toFixed(2).replace('.', ',')} foi adicionada.`,
      });

      // Limpar formulário
      setDescription('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: "Erro ao cadastrar despesa",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Error deleting expense:', error);
        toast({
          title: "Erro ao remover despesa",
          description: "Não foi possível remover a despesa.",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      
      toast({
        title: "Despesa removida",
        description: "A despesa foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Erro ao remover despesa",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const currentDate = new Date();
    return expenseDate.getMonth() === currentDate.getMonth() && 
           expenseDate.getFullYear() === currentDate.getFullYear();
  }).reduce((sum, expense) => sum + expense.amount, 0);

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Acesso restrito a administradores.</p>
      </div>
    );
  }

  if (isLoadingExpenses) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Despesas</h1>
        <p className="text-gray-600">Controle suas despesas e custos operacionais</p>
      </div>

      {/* Resumo das despesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalExpenses.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Despesas do Mês</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {currentMonthExpenses.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de cadastro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Cadastrar Nova Despesa
          </CardTitle>
          <CardDescription>
            Registre uma nova despesa ou custo operacional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição da Despesa *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva a despesa (ex: Aluguel, Energia elétrica, etc.)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Input
                    id="category"
                    type="text"
                    placeholder="Ex: Operacional, Marketing, etc."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar Despesa'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas Cadastradas</CardTitle>
          <CardDescription>
            Histórico de todas as despesas registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma despesa cadastrada ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-semibold">{expense.description}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Categoria: {expense.category}</span>
                          <span>Data: {formatDate(expense.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        R$ {expense.amount.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseManagement;
