-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (via triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(user_id, created_at DESC);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new appointments
CREATE OR REPLACE FUNCTION public.notify_new_appointment()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the professional
  PERFORM create_notification(
    NEW.professional_id,
    'appointment',
    'Nouveau rendez-vous',
    'Vous avez un nouveau rendez-vous programmé',
    jsonb_build_object('appointment_id', NEW.id, 'scheduled_at', NEW.scheduled_at)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_appointment_created
AFTER INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_appointment();

-- Trigger for appointment status changes
CREATE OR REPLACE FUNCTION public.notify_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> NEW.status THEN
    -- Notify the patient
    PERFORM create_notification(
      NEW.patient_id,
      'appointment',
      'Statut du rendez-vous mis à jour',
      CASE NEW.status
        WHEN 'confirmed' THEN 'Votre rendez-vous a été confirmé'
        WHEN 'cancelled' THEN 'Votre rendez-vous a été annulé'
        WHEN 'completed' THEN 'Votre rendez-vous est terminé'
        ELSE 'Le statut de votre rendez-vous a changé'
      END,
      jsonb_build_object('appointment_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_appointment_status_changed
AFTER UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.notify_appointment_status_change();

-- Trigger for new messages
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_name TEXT;
BEGIN
  -- Get the recipient (the other participant in the conversation)
  SELECT 
    CASE 
      WHEN c.participant_1 = NEW.sender_id THEN c.participant_2
      ELSE c.participant_1
    END INTO v_recipient_id
  FROM public.conversations c
  WHERE c.id = NEW.conversation_id;
  
  -- Get sender name
  SELECT full_name INTO v_sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;
  
  -- Notify recipient
  IF v_recipient_id IS NOT NULL THEN
    PERFORM create_notification(
      v_recipient_id,
      'message',
      'Nouveau message',
      COALESCE(v_sender_name, 'Quelqu''un') || ' vous a envoyé un message',
      jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_message_created
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();

-- Trigger for event registrations
CREATE OR REPLACE FUNCTION public.notify_event_registration()
RETURNS TRIGGER AS $$
DECLARE
  v_event_title TEXT;
  v_organizer_id UUID;
BEGIN
  -- Get event info
  SELECT title, organizer_id INTO v_event_title, v_organizer_id
  FROM public.events
  WHERE id = NEW.event_id;
  
  -- Notify the user who registered
  PERFORM create_notification(
    NEW.user_id,
    'event',
    'Inscription confirmée',
    'Vous êtes inscrit à l''événement: ' || v_event_title,
    jsonb_build_object('event_id', NEW.event_id, 'registration_id', NEW.id)
  );
  
  -- Notify the organizer
  IF v_organizer_id IS NOT NULL THEN
    PERFORM create_notification(
      v_organizer_id,
      'event',
      'Nouvelle inscription',
      'Nouvelle inscription à votre événement: ' || v_event_title,
      jsonb_build_object('event_id', NEW.event_id, 'registration_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_event_registration_created
AFTER INSERT ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.notify_event_registration();

-- Trigger for upgrade request status changes
CREATE OR REPLACE FUNCTION public.notify_upgrade_request_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    PERFORM create_notification(
      NEW.user_id,
      'upgrade',
      CASE NEW.status
        WHEN 'approved' THEN 'Demande approuvée'
        ELSE 'Demande refusée'
      END,
      CASE NEW.status
        WHEN 'approved' THEN 'Félicitations! Votre demande de professionnel a été approuvée'
        ELSE 'Votre demande de professionnel a été refusée. ' || COALESCE(NEW.rejection_reason, '')
      END,
      jsonb_build_object('request_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_upgrade_request_status_changed
AFTER UPDATE ON public.upgrade_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_upgrade_request_status();