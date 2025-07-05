
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, LogOut, Package, FileText, TrendingUp, CreditCard } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-2xl font-bold text-primary">OrderBiza</Link>
              
              <nav className="hidden md:flex space-x-6">
                <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                
                {/* Admin-only navigation */}
                {isAdmin && (
                  <>
                    <Link to="/produtos/cadastrar" className="text-gray-600 hover:text-primary transition-colors">
                      Cadastrar Produtos
                    </Link>
                    <Link to="/gerenciar-pedidos" className="text-gray-600 hover:text-primary transition-colors">
                      Gerenciar Pedidos
                    </Link>
                    <Link to="/despesas" className="text-gray-600 hover:text-primary transition-colors">
                      Despesas
                    </Link>
                  </>
                )}
                
                {/* Available to all authenticated users */}
                <Link to="/produtos/catalogo" className="text-gray-600 hover:text-primary transition-colors">
                  Catálogo
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Cart - only for customers */}
              {user?.role === 'customer' && (
                <Link to="/carrinho" className="relative">
                  <Button variant="outline" size="sm">
                    <ShoppingCart className="h-4 w-4" />
                    {cartItemsCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                      {user?.role && (
                        <p className="text-xs text-primary capitalize">
                          {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Customer-only menu items */}
                  {user?.role === 'customer' && (
                    <DropdownMenuItem asChild>
                      <Link to="/meus-pedidos" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        Meus Pedidos
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
