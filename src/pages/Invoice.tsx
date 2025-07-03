
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
  };
}

interface Order {
  id: string;
  user_id: string;
  total: number;
  shipping_fee: number;
  shipping_address: any;
  payment_method: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

const Invoice = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId && user) {
      fetchOrder();
    }
  }, [orderId, user]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          total,
          shipping_fee,
          shipping_address,
          payment_method,
          status,
          created_at,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              name
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Erro ao carregar fatura",
          description: "Não foi possível carregar os dados da fatura.",
          variant: "destructive",
        });
        return;
      }

      // Check if user has permission to view this order
      if (data.user_id !== user?.id && user?.role !== 'admin') {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para visualizar esta fatura.",
          variant: "destructive",
        });
        return;
      }

      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Erro ao carregar fatura",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // Em produção, implementar geração real de PDF
    // Aqui simulamos o download
    const element = document.getElementById('invoice-content');
    if (element) {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fatura não encontrada</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Pedido não encontrado ou inválido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto Bancário'
    };
    return methods[method] || method;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedido Concluído</h1>
          <p className="text-gray-600">Pedido #{order.id.slice(0, 8)}</p>
        </div>
        <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Baixar PDF
        </Button>
      </div>

      <Card id="invoice-content">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6" />
                FATURA
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Data: {formatDate(order.created_at)}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">OrderBiza</h2>
              <p className="text-sm text-gray-600">
                Sistema de Gestão Empresarial
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informações do Pedido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Informações do Pedido</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Número:</strong> #{order.id.slice(0, 8)}</p>
                <p><strong>Data:</strong> {formatDate(order.created_at)}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Forma de Pagamento:</strong> {getPaymentMethodName(order.payment_method)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Endereço de Entrega</h3>
              <div className="text-sm text-gray-600">
                <p>{order.shipping_address.street}, {order.shipping_address.number}</p>
                {order.shipping_address.complement && <p>{order.shipping_address.complement}</p>}
                <p>{order.shipping_address.neighborhood}</p>
                <p>{order.shipping_address.city}/{order.shipping_address.state}</p>
                <p>CEP: {order.shipping_address.zipCode}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Itens do Pedido */}
          <div>
            <h3 className="font-semibold mb-4">Itens do Pedido</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Produto</th>
                    <th className="text-center py-2">Qtd</th>
                    <th className="text-right py-2">Valor Unit.</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">{item.products.name}</td>
                      <td className="text-center py-3">{item.quantity}</td>
                      <td className="text-right py-3">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="text-right py-3">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Totais */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete:</span>
                <span>R$ {order.shipping_fee.toFixed(2).replace('.', ',')}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Geral:</span>
                <span>R$ {(order.total + order.shipping_fee).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600">
              <strong>Observações:</strong> Esta é uma fatura gerada automaticamente pelo sistema OrderBiza. 
              Em caso de dúvidas, entre em contato conosco.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoice;
