
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProductRegistration from "./pages/ProductRegistration";
import ProductCatalog from "./pages/ProductCatalog";
import Cart from "./pages/Cart";
import Invoice from "./pages/Invoice";
import MyOrders from "./pages/MyOrders";
import OrderManagement from "./pages/OrderManagement";
import ExpenseManagement from "./pages/ExpenseManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/produtos/cadastrar" element={
                <ProtectedRoute>
                  <Layout>
                    <ProductRegistration />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/produtos/catalogo" element={
                <ProtectedRoute>
                  <Layout>
                    <ProductCatalog />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/carrinho" element={
                <ProtectedRoute>
                  <Layout>
                    <Cart />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/fatura/:orderId" element={
                <ProtectedRoute>
                  <Layout>
                    <Invoice />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/meus-pedidos" element={
                <ProtectedRoute>
                  <Layout>
                    <MyOrders />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/gerenciar-pedidos" element={
                <ProtectedRoute>
                  <Layout>
                    <OrderManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/despesas" element={
                <ProtectedRoute>
                  <Layout>
                    <ExpenseManagement />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
