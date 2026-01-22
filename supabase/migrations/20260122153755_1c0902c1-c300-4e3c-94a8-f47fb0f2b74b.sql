-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all permissions" ON public.admin_permissions;
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.admin_permissions;

-- Create specific policies for each operation
-- Allow admins to select all permissions
CREATE POLICY "Admins can select all permissions" 
ON public.admin_permissions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert permissions
CREATE POLICY "Admins can insert permissions" 
ON public.admin_permissions 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update permissions
CREATE POLICY "Admins can update permissions" 
ON public.admin_permissions 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete permissions
CREATE POLICY "Admins can delete permissions" 
ON public.admin_permissions 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Allow users to view their own permissions
CREATE POLICY "Users can view own permissions" 
ON public.admin_permissions 
FOR SELECT 
USING (auth.uid() = user_id);