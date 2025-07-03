
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Package, Clock, Truck, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  status: string;
  total: number;
  shipping_fee: number;
  created_at: string;
  shipping_address: any;
  payment_method: string;
  order_items: OrderItem[];
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          status,
          total,
          shipping_fee,
          created_at,
          shipping_address,
          payment_method,
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Erro ao carregar pedidos",
          description: "Não foi possível carregar os pedidos.",
          variant: "destructive",
        });
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        toast({
          title: "Erro ao atualizar status",
          description: "Não foi possível atualizar o status do pedido.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: "Status atualizado!",
        description: `Pedido foi marcado como "${newStatus}".`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Acesso restrito a administradores.</p>
      </div>
    );
  }

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
                    <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription>
                      Realizado em {formatDate(order.created_at)}
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
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.products.name} (x{item.quantity})</span>
                            <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>R$ {(order.total + order.shipping_fee).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Forma de Pagamento:</h4>
                      <p className="text-sm text-gray-600">{getPaymentMethodName(order.payment_method)}</p>
                    </div>
                  </div>

                  {/* Endereço e ações */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Endereço de Entrega:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.shipping_address.street}, {order.shipping_address.number}</p>
                        {order.shipping_address.complement && (
                          <p>{order.shipping_address.complement}</p>
                        )}
                        <p>{order.shipping_address.neighborhood}</p>
                        <p>{order.shipping_address.city}/{order.shipping_address.state}</p>
                        <p>CEP: {order.shipping_address.zipCode}</p>
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
