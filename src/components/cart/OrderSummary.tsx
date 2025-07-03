
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  orderTotal: number;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
}

export const OrderSummary = ({ 
  subtotal, 
  shipping, 
  orderTotal, 
  paymentMethod, 
  setPaymentMethod, 
  onCheckout, 
  isCheckingOut 
}: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Frete:</span>
          <span>R$ {shipping.toFixed(2).replace('.', ',')}</span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>R$ {orderTotal.toFixed(2).replace('.', ',')}</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment">Forma de Pagamento *</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
              <SelectItem value="debit_card">Cartão de Débito</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="boleto">Boleto Bancário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full" 
          size="lg"
          onClick={onCheckout}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? 'Processando...' : 'Finalizar Pedido'}
        </Button>
      </CardContent>
    </Card>
  );
};
