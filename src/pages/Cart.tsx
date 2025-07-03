
import { useCart } from '@/contexts/CartContext';
import { CartItemsList } from '@/components/cart/CartItemsList';
import { ShippingForm } from '@/components/cart/ShippingForm';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { useCheckout } from '@/hooks/useCheckout';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const {
    shippingData,
    paymentMethod,
    setPaymentMethod,
    isCheckingOut,
    handleInputChange,
    handleCheckout
  } = useCheckout();

  const subtotal = total;
  const shipping = 15.00;
  const orderTotal = subtotal + shipping;

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Carrinho de Compras</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CartItemsList 
            items={items}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
          />
          
          <ShippingForm
            shippingData={shippingData}
            onInputChange={handleInputChange}
          />
        </div>

        <div className="space-y-4">
          <OrderSummary
            subtotal={subtotal}
            shipping={shipping}
            orderTotal={orderTotal}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onCheckout={handleCheckout}
            isCheckingOut={isCheckingOut}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
