
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Package, Clock, Truck, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
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
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    // Carregar pedidos do localStorage - em produção, usar Supabase
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders.reverse()); // Mais recentes primeiro
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders.reverse()));
    
    toast({
      title: "Status atualizado!",
      description: `Pedido #${orderId} foi marcado como "${newStatus}".`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pedido Realizado':
        return <Clock className="h-4 w-4" />;
      case 'Em Preparação':
        return <Package className="h-4 w-4" />;
      case 'Enviado':
        return <Truck className="h-4 w-4" />;
      case 'Entregue':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pedido Realizado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Em Preparação':
        return 'bg-blue-100 text-blue-800';
      case 'Enviado':
        return 'bg-purple-100 text-purple-800';
      case 'Entregue':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto Bancário',
    };
    return methods[method] || method;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pedidos</h1>
        <p className="text-gray-600">Atualize o status dos pedidos dos clientes</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'Pedido Realizado').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Preparação</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'Em Preparação').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enviados</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'Enviado').length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de pedidos */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                    <CardDescription>
                      Realizado em {formatDate(order.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informações do pedido */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Itens do Pedido:</h4>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.name} (x{item.quantity})</span>
                            <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>R$ {(order.total + 15).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Forma de Pagamento:</h4>
                      <p className="text-sm text-gray-600">{getPaymentMethodName(order.paymentMethod)}</p>
                    </div>
                  </div>

                  {/* Endereço e ações */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Endereço de Entrega:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                        {order.shippingAddress.complement && (
                          <p>{order.shippingAddress.complement}</p>
                        )}
                        <p>{order.shippingAddress.neighborhood}</p>
                        <p>{order.shippingAddress.city}/{order.shippingAddress.state}</p>
                        <p>CEP: {order.shippingAddress.zipCode}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Atualizar Status:</h4>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pedido Realizado">Pedido Realizado</SelectItem>
                          <SelectItem value="Em Preparação">Em Preparação</SelectItem>
                          <SelectItem value="Enviado">Enviado</SelectItem>
                          <SelectItem value="Entregue">Entregue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
