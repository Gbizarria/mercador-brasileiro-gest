import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, FileText } from 'lucide-react';
interface Order {
  id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  status: string;
  createdAt: string;
}
const Invoice = () => {
  const {
    orderId
  } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => {
    // Carregar pedido do localStorage - em produção, usar Supabase
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const foundOrder = orders.find((o: Order) => o.id === orderId);
    setOrder(foundOrder);
  }, [orderId]);
  const handleDownloadPDF = () => {
    // Em produção, implementar geração real de PDF
    // Aqui simulamos o download
    const element = document.getElementById('invoice-content');
    if (element) {
      window.print();
    }
  };
  if (!order) {
    return <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fatura não encontrada</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Pedido não encontrado ou inválido.</p>
          </CardContent>
        </Card>
      </div>;
  }
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  const getPaymentMethodName = (method: string) => {
    const methods: {
      [key: string]: string;
    } = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto Bancário'
    };
    return methods[method] || method;
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedido Concluído</h1>
          <p className="text-gray-600">Pedido #{order.id}</p>
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
                Data: {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">ERP Sistema</h2>
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
                <p><strong>Número:</strong> #{order.id}</p>
                <p><strong>Data:</strong> {formatDate(order.createdAt)}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Forma de Pagamento:</strong> {getPaymentMethodName(order.paymentMethod)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Endereço de Entrega</h3>
              <div className="text-sm text-gray-600">
                <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                {order.shippingAddress.complement && <p>{order.shippingAddress.complement}</p>}
                <p>{order.shippingAddress.neighborhood}</p>
                <p>{order.shippingAddress.city}/{order.shippingAddress.state}</p>
                <p>CEP: {order.shippingAddress.zipCode}</p>
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
                  {order.items.map(item => <tr key={item.id} className="border-b">
                      <td className="py-3">{item.name}</td>
                      <td className="text-center py-3">{item.quantity}</td>
                      <td className="text-right py-3">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="text-right py-3">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </td>
                    </tr>)}
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
                <span>R$ 15,00</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Geral:</span>
                <span>R$ {(order.total + 15).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600">
              <strong>Observações:</strong> Esta é uma fatura gerada automaticamente pelo sistema ERP. 
              Em caso de dúvidas, entre em contato conosco.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Invoice;