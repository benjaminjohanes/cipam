-- Create formations table
CREATE TABLE public.formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  level TEXT NOT NULL DEFAULT 'débutant',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration TEXT,
  modules_count INTEGER DEFAULT 0,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS policies for formations
CREATE POLICY "Anyone can view approved formations"
ON public.formations FOR SELECT
USING (status = 'approved');

CREATE POLICY "Authors can view their own formations"
ON public.formations FOR SELECT
USING (auth.uid() = author_id);

CREATE POLICY "Authors can create formations"
ON public.formations FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own formations"
ON public.formations FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own formations"
ON public.formations FOR DELETE
USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all formations"
ON public.formations FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for services
CREATE POLICY "Anyone can view approved services"
ON public.services FOR SELECT
USING (status = 'approved');

CREATE POLICY "Providers can view their own services"
ON public.services FOR SELECT
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can create services"
ON public.services FOR INSERT
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update their own services"
ON public.services FOR UPDATE
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete their own services"
ON public.services FOR DELETE
USING (auth.uid() = provider_id);

CREATE POLICY "Admins can manage all services"
ON public.services FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_formations_updated_at
BEFORE UPDATE ON public.formations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();