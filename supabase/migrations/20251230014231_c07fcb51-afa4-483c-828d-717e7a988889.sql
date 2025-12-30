-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'webinar', -- webinar, in-person, hybrid, other
  image_url TEXT,
  location TEXT, -- For in-person events
  online_link TEXT, -- For webinars
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  price NUMERIC NOT NULL DEFAULT 0, -- 0 = free
  is_free BOOLEAN GENERATED ALWAYS AS (price = 0) STORED,
  organizer_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published, cancelled, completed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event registrations table (tickets)
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, cancelled, attended
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, refunded, free
  ticket_number TEXT NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view published events" 
ON public.events 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Organizers can manage their own events" 
ON public.events 
FOR ALL 
USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can manage all events" 
ON public.events 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Event registrations policies
CREATE POLICY "Users can view their own registrations" 
ON public.event_registrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" 
ON public.event_registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own registrations" 
ON public.event_registrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Organizers can view registrations for their events" 
ON public.event_registrations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.events 
  WHERE events.id = event_registrations.event_id 
  AND events.organizer_id = auth.uid()
));

CREATE POLICY "Admins can manage all registrations" 
ON public.event_registrations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_event_registrations_updated_at
BEFORE UPDATE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create function to generate ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || UPPER(SUBSTRING(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_ticket_number_trigger
BEFORE INSERT ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.generate_ticket_number();