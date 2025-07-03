
-- Fix missing RLS policies

-- Add INSERT policy for profiles (currently missing)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Add DELETE policies for orders (currently missing)
CREATE POLICY "Admins can delete orders" 
ON public.orders FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Add DELETE policies for order_items (currently missing)
CREATE POLICY "Admins can delete order items" 
ON public.order_items FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Add UPDATE policies for order_items (currently missing)
CREATE POLICY "Admins can update order items" 
ON public.order_items FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Add UPDATE policy for order_items for users (for their own orders)
CREATE POLICY "Users can update order items for their orders" 
ON public.order_items FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);
