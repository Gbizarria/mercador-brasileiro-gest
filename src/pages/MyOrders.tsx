
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Package, Clock, Truck } from 'lucide-react';
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
  status: string;
  total: number;
  shipping_fee: number;
  created_at: string;
  order_items: OrderItem[];
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total,
          shipping_fee,
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
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
        <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Você ainda não fez nenhum pedido</p>
            <Button asChild>
              <Link to="/produtos/catalogo">
                Fazer Primeiro Pedido
              </Link>
            </Button>
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
                <div className="space-y-4">
                  {/* Lista de itens */}
                  <div>
                    <h4 className="font-medium mb-2">Itens:</h4>
                    <div className="space-y-1">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.products.name} (x{item.quantity})</span>
                          <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total e ações */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <span className="font-semibold">
                        Total: R$ {(order.total + order.shipping_fee).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">(incluindo frete)</span>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/fatura/${order.id}`} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Ver Fatura
                      </Link>
                    </Button>
                  </div>

                  {/* Timeline do status */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Acompanhamento:</h4>
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center gap-2 ${
                        order.status === 'Pedido Realizado' || 
                        order.status === 'Em Preparação' || 
                        order.status === 'Enviado' 
                          ? 'text-green-600' 
                          : 'text-gray-400'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          order.status === 'Pedido Realizado' || 
                          order.status === 'Em Preparação' || 
                          order.status === 'Enviado' 
                            ? 'bg-green-600' 
                            : 'bg-gray-300'
                        }`} />
                        <span className="text-sm">Pedido Realizado</span>
                      </div>

                      <div className={`w-8 h-px ${
                        order.status === 'Em Preparação' || order.status === 'Enviado'
                          ? 'bg-green-600' 
                          : 'bg-gray-300'
                      }`} />

                      <div className={`flex items-center gap-2 ${
                        order.status === 'Em Preparação' || order.status === 'Enviado'
                          ? 'text-green-600' 
                          : 'text-gray-400'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          order.status === 'Em Preparação' || order.status === 'Enviado'
                            ? 'bg-green-600' 
                            : 'bg-gray-300'
                        }`} />
                        <span className="text-sm">Em Preparação</span>
                      </div>

                      <div className={`w-8 h-px ${
                        order.status === 'Enviado'
                          ? 'bg-green-600' 
                          : 'bg-gray-300'
                      }`} />

                      <div className={`flex items-center gap-2 ${
                        order.status === 'Enviado'
                          ? 'text-green-600' 
                          : 'text-gray-400'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          order.status === 'Enviado'
                            ? 'bg-green-600' 
                            : 'bg-gray-300'
                        }`} />
                        <span className="text-sm">Enviado</span>
                      </div>
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

export default MyOrders;
