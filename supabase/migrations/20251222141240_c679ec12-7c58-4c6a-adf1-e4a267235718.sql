-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'in-person')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Patients can view their own appointments
CREATE POLICY "Patients can view their own appointments"
ON public.appointments
FOR SELECT
USING (auth.uid() = patient_id);

-- Professionals can view appointments where they are the professional
CREATE POLICY "Professionals can view their appointments"
ON public.appointments
FOR SELECT
USING (auth.uid() = professional_id);

-- Patients can create appointments
CREATE POLICY "Patients can create appointments"
ON public.appointments
FOR INSERT
WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own appointments (cancel, reschedule)
CREATE POLICY "Patients can update their own appointments"
ON public.appointments
FOR UPDATE
USING (auth.uid() = patient_id);

-- Professionals can update appointments (confirm, complete)
CREATE POLICY "Professionals can update their appointments"
ON public.appointments
FOR UPDATE
USING (auth.uid() = professional_id);

-- Patients can delete their own appointments
CREATE POLICY "Patients can delete their own appointments"
ON public.appointments
FOR DELETE
USING (auth.uid() = patient_id);

-- Admins can manage all appointments
CREATE POLICY "Admins can manage all appointments"
ON public.appointments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create index for performance
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_professional ON public.appointments(professional_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);