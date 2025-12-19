import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Plus, Trash2, Save } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const DAYS = [
  { id: "monday", label: "Lundi" },
  { id: "tuesday", label: "Mardi" },
  { id: "wednesday", label: "Mercredi" },
  { id: "thursday", label: "Jeudi" },
  { id: "friday", label: "Vendredi" },
  { id: "saturday", label: "Samedi" },
  { id: "sunday", label: "Dimanche" },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return [`${hour}:00`, `${hour}:30`];
}).flat();

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

type WeekAvailability = Record<string, DayAvailability>;

const defaultAvailability: WeekAvailability = {
  monday: { enabled: true, slots: [{ id: "1", start: "09:00", end: "12:00" }, { id: "2", start: "14:00", end: "18:00" }] },
  tuesday: { enabled: true, slots: [{ id: "1", start: "09:00", end: "12:00" }, { id: "2", start: "14:00", end: "18:00" }] },
  wednesday: { enabled: true, slots: [{ id: "1", start: "09:00", end: "12:00" }] },
  thursday: { enabled: true, slots: [{ id: "1", start: "09:00", end: "12:00" }, { id: "2", start: "14:00", end: "18:00" }] },
  friday: { enabled: true, slots: [{ id: "1", start: "09:00", end: "12:00" }, { id: "2", start: "14:00", end: "17:00" }] },
  saturday: { enabled: false, slots: [] },
  sunday: { enabled: false, slots: [] },
};

export default function Availability() {
  const [availability, setAvailability] = useState<WeekAvailability>(defaultAvailability);
  const [consultationDuration, setConsultationDuration] = useState("60");

  const toggleDay = (dayId: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        enabled: !prev[dayId].enabled,
      },
    }));
  };

  const addSlot = (dayId: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        slots: [...prev[dayId].slots, { id: Date.now().toString(), start: "09:00", end: "10:00" }],
      },
    }));
  };

  const removeSlot = (dayId: string, slotId: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        slots: prev[dayId].slots.filter(s => s.id !== slotId),
      },
    }));
  };

  const updateSlot = (dayId: string, slotId: string, field: "start" | "end", value: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        slots: prev[dayId].slots.map(s => s.id === slotId ? { ...s, [field]: value } : s),
      },
    }));
  };

  const handleSave = () => {
    toast.success("Disponibilités enregistrées avec succès");
  };

  return (
    <DashboardLayout title="Mes disponibilités" description="Gérez vos créneaux de consultation">
      <div className="space-y-6">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Paramètres de consultation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label htmlFor="duration">Durée d'une consultation</Label>
              <Select value={consultationDuration} onValueChange={setConsultationDuration}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                  <SelectItem value="120">2 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Disponibilités hebdomadaires
            </CardTitle>
            <CardDescription>Définissez vos créneaux pour chaque jour de la semaine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DAYS.map((day) => (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={availability[day.id].enabled}
                      onCheckedChange={() => toggleDay(day.id)}
                    />
                    <Label className="font-medium">{day.label}</Label>
                  </div>
                  {availability[day.id].enabled && (
                    <Button variant="outline" size="sm" onClick={() => addSlot(day.id)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un créneau
                    </Button>
                  )}
                </div>

                {availability[day.id].enabled && (
                  <div className="space-y-2 ml-10">
                    {availability[day.id].slots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-2">
                        <Select value={slot.start} onValueChange={(v) => updateSlot(day.id, slot.id, "start", v)}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">à</span>
                        <Select value={slot.end} onValueChange={(v) => updateSlot(day.id, slot.id, "end", v)}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeSlot(day.id, slot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {availability[day.id].slots.length === 0 && (
                      <p className="text-sm text-muted-foreground">Aucun créneau défini</p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les disponibilités
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
