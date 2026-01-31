-- Allow anonymous users to view profiles (for public pages like professionals directory)
CREATE POLICY "Anyone can view profiles" 
ON public.profiles 
FOR SELECT 
TO anon
USING (true);