
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ShippingData {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface ShippingFormProps {
  shippingData: ShippingData;
  onInputChange: (field: string, value: string) => void;
}

export const ShippingForm = ({ shippingData, onInputChange }: ShippingFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados de Entrega</CardTitle>
        <CardDescription>Informe o endereço para entrega</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="street">Rua *</Label>
            <Input
              id="street"
              placeholder="Nome da rua"
              value={shippingData.street}
              onChange={(e) => onInputChange('street', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              placeholder="123"
              value={shippingData.number}
              onChange={(e) => onInputChange('number', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            placeholder="Apto, bloco, etc. (opcional)"
            value={shippingData.complement}
            onChange={(e) => onInputChange('complement', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              placeholder="Nome do bairro"
              value={shippingData.neighborhood}
              onChange={(e) => onInputChange('neighborhood', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              placeholder="Nome da cidade"
              value={shippingData.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">Estado *</Label>
            <Input
              id="state"
              placeholder="UF"
              maxLength={2}
              value={shippingData.state}
              onChange={(e) => onInputChange('state', e.target.value.toUpperCase())}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">CEP *</Label>
            <Input
              id="zipCode"
              placeholder="00000-000"
              value={shippingData.zipCode}
              onChange={(e) => onInputChange('zipCode', e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
