
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Minus, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('');

  const steps = [
    { id: 1, title: 'Confirmação da Compra', description: 'Revise os itens selecionados' },
    { id: 2, title: 'Endereço de Entrega', description: 'Informe o endereço para entrega' },
    { id: 3, title: 'Forma de Pagamento', description: 'Escolha como deseja pagar' },
    { id: 4, title: 'Revisão Final', description: 'Confirme todos os dados' },
  ];

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    toast({
      title: "Item removido",
      description: "O produto foi removido do carrinho.",
    });
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalizePurchase = () => {
    // Simular finalização da compra
    const orderId = Date.now().toString();
    const order = {
      id: orderId,
      items: [...items],
      total,
      shippingAddress,
      paymentMethod,
      status: 'Pedido Realizado',
      createdAt: new Date().toISOString(),
    };

    // Salvar pedido no localStorage - em produção, usar Supabase
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    clearCart();
    
    toast({
      title: "Pedido realizado com sucesso!",
      description: `Pedido #${orderId} foi criado.`,
    });

    navigate(`/fatura/${orderId}`);
  };

  if (items.length === 0 && currentStep === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carrinho de Compras</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
            <Button onClick={() => navigate('/produtos/catalogo')}>
              Continuar Comprando
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Carrinho de Compras</h1>
        <p className="text-gray-600">Etapa {currentStep} de 4: {steps[currentStep - 1].title}</p>
      </div>

      {/* Indicador de etapas */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold ${
                currentStep >= step.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step.id}
            </div>
            <div className="ml-2 hidden sm:block">
              <p className="font-medium">{step.title}</p>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="w-12 h-px bg-gray-300 mx-4 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Etapa 1: Confirmação da Compra */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="font-bold text-primary">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span>R$ 15,00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>R$ {(total + 15).toFixed(2).replace('.', ',')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Etapa 2: Endereço de Entrega */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Endereço de Entrega</CardTitle>
            <CardDescription>Informe o endereço onde deseja receber o pedido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Rua/Avenida</Label>
                <Input
                  id="street"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={shippingAddress.number}
                  onChange={(e) => setShippingAddress({...shippingAddress, number: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={shippingAddress.complement}
                  onChange={(e) => setShippingAddress({...shippingAddress, complement: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={shippingAddress.neighborhood}
                  onChange={(e) => setShippingAddress({...shippingAddress, neighborhood: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Etapa 3: Forma de Pagamento */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Forma de Pagamento</CardTitle>
            <CardDescription>Escolha como deseja pagar pelo pedido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="credit_card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio"
                />
                <span>Cartão de Crédito</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="debit_card"
                  checked={paymentMethod === 'debit_card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio"
                />
                <span>Cartão de Débito</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  checked={paymentMethod === 'pix'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio"
                />
                <span>PIX</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="boleto"
                  checked={paymentMethod === 'boleto'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio"
                />
                <span>Boleto Bancário</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Etapa 4: Revisão Final */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revisão Final</CardTitle>
              <CardDescription>Confirme todos os dados antes de finalizar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumo dos itens */}
              <div>
                <h3 className="font-semibold mb-2">Itens do Pedido</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Endereço */}
              <div>
                <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
                <p className="text-sm text-gray-600">
                  {shippingAddress.street}, {shippingAddress.number}
                  {shippingAddress.complement && `, ${shippingAddress.complement}`}
                  <br />
                  {shippingAddress.neighborhood} - {shippingAddress.city}/{shippingAddress.state}
                  <br />
                  CEP: {shippingAddress.zipCode}
                </p>
              </div>

              <Separator />

              {/* Forma de pagamento */}
              <div>
                <h3 className="font-semibold mb-2">Forma de Pagamento</h3>
                <p className="text-sm text-gray-600">
                  {paymentMethod === 'credit_card' && 'Cartão de Crédito'}
                  {paymentMethod === 'debit_card' && 'Cartão de Débito'}
                  {paymentMethod === 'pix' && 'PIX'}
                  {paymentMethod === 'boleto' && 'Boleto Bancário'}
                </p>
              </div>

              <Separator />

              {/* Total */}
              <div className="text-right">
                <div className="text-2xl font-bold">
                  Total: R$ {(total + 15).toFixed(2).replace('.', ',')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botões de navegação */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNextStep}>
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleFinalizePurchase} className="bg-green-600 hover:bg-green-700">
            Finalizar Compra
          </Button>
        )}
      </div>
    </div>
  );
};

export default Cart;
