import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Video, MapPin, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Professional {
  id: string;
  full_name: string | null;
  specialty: string | null;
  avatar_url: string | null;
  consultation_rate: number | null;
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional: Professional;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

const durations = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 heure" },
  { value: "90", label: "1h30" },
];

export function BookingDialog({ open, onOpenChange, professional }: BookingDialogProps) {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");
  const [duration, setDuration] = useState("60");
  const [type, setType] = useState<"video" | "in-person">("video");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date || !time) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date et une heure",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour prendre rendez-vous",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const [hours, minutes] = time.split(':').map(Number);
      const scheduledAt = new Date(date);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from("appointments")
        .insert({
          patient_id: user.id,
          professional_id: professional.id,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(duration),
          type,
          notes: notes || null,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Rendez-vous demandé",
        description: "Votre demande de rendez-vous a été envoyée. Vous recevrez une confirmation.",
      });

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le rendez-vous",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setDate(undefined);
    setTime("");
    setDuration("60");
    setType("video");
    setNotes("");
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Prendre rendez-vous</DialogTitle>
          <DialogDescription>
            Réservez une consultation avec {professional.full_name || "ce professionnel"}
          </DialogDescription>
        </DialogHeader>

        {/* Professional Summary */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <img
            src={professional.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"}
            alt={professional.full_name || "Professionnel"}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold text-foreground">{professional.full_name}</p>
            <p className="text-sm text-muted-foreground">{professional.specialty}</p>
          </div>
          {professional.consultation_rate && professional.consultation_rate > 0 && (
            <div className="text-right">
              <p className="font-bold text-primary">{formatPrice(professional.consultation_rate)}</p>
              <p className="text-xs text-muted-foreground">par consultation</p>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 justify-center my-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Step 1: Date Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Choisissez une date</Label>
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                locale={fr}
                className={cn("p-3 pointer-events-auto border rounded-lg")}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!date}>
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Time and Duration */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Choisissez un horaire</Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={time === slot ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTime(slot)}
                    className="text-sm"
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Durée de la consultation</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button onClick={() => setStep(3)} disabled={!time}>
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Type and Notes */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Type de consultation</Label>
              <RadioGroup value={type} onValueChange={(v) => setType(v as "video" | "in-person")}>
                <div className="flex gap-4">
                  <Label
                    htmlFor="video"
                    className={cn(
                      "flex-1 flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                      type === "video" ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <RadioGroupItem value="video" id="video" />
                    <Video className="w-5 h-5" />
                    <span>Vidéo</span>
                  </Label>
                  <Label
                    htmlFor="in-person"
                    className={cn(
                      "flex-1 flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                      type === "in-person" ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <RadioGroupItem value="in-person" id="in-person" />
                    <MapPin className="w-5 h-5" />
                    <span>En personne</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Notes (optionnel)</Label>
              <Textarea
                placeholder="Décrivez brièvement le motif de votre consultation..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Summary */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="font-medium text-foreground">Récapitulatif</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {date && format(date, "EEEE d MMMM yyyy", { locale: fr })}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {time} ({durations.find(d => d.value === duration)?.label})
                </p>
                <p className="flex items-center gap-2">
                  {type === "video" ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  {type === "video" ? "Consultation vidéo" : "Consultation en personne"}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Retour
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Envoi..." : "Confirmer le rendez-vous"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}