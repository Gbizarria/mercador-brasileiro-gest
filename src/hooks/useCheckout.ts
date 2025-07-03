
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShippingData {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export const useCheckout = () => {
  const { items, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [shippingData, setShippingData] = useState<ShippingData>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('');

  const handleInputChange = (field: string, value: string) => {
    const maxLengths: { [key: string]: number } = {
      street: 100,
      number: 10,
      complement: 50,
      neighborhood: 50,
      city: 50,
      state: 2,
      zipCode: 9
    };

    if (value.length <= (maxLengths[field] || 100)) {
      setShippingData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateShippingData = () => {
    const required = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
    
    for (const field of required) {
      if (!shippingData[field as keyof typeof shippingData].trim()) {
        toast({
          title: "Dados incompletos",
          description: "Por favor, preencha todos os campos obrigatórios do endereço.",
          variant: "destructive",
        });
        return false;
      }
    }

    const zipCodeRegex = /^\d{5}-?\d{3}$/;
    if (!zipCodeRegex.test(shippingData.zipCode)) {
      toast({
        title: "CEP inválido",
        description: "Por favor, insira um CEP válido (formato: 00000-000).",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para finalizar a compra.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a compra.",
        variant: "destructive",
      });
      return;
    }

    if (!validateShippingData()) {
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Forma de pagamento",
        description: "Por favor, selecione uma forma de pagamento.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      const shipping = 15.00;
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: total,
          shipping_fee: shipping,
          payment_method: paymentMethod,
          shipping_address: shippingData,
          status: 'Pedido Realizado'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        toast({
          title: "Erro ao processar pedido",
          description: "Não foi possível processar seu pedido. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        await supabase.from('orders').delete().eq('id', order.id);
        
        toast({
          title: "Erro ao processar pedido",
          description: "Não foi possível processar seu pedido. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      clearCart();
      
      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${order.id.slice(0, 8)} foi processado.`,
      });

      navigate(`/fatura/${order.id}`);
    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: "Erro ao processar pedido",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return {
    shippingData,
    paymentMethod,
    setPaymentMethod,
    isCheckingOut,
    handleInputChange,
    handleCheckout
  };
};
