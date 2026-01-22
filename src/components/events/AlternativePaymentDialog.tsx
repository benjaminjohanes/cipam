import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Copy, Check, Loader2 } from "lucide-react";
import { AlternativePaymentSettings } from "@/hooks/usePlatformSettings";
import { toast } from "sonner";

interface AlternativePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AlternativePaymentSettings;
  eventTitle: string;
  amount: number;
  onConfirm: (method: "bank_transfer" | "on_site") => Promise<void>;
  isProcessing: boolean;
}

export function AlternativePaymentDialog({
  open,
  onOpenChange,
  settings,
  eventTitle,
  amount,
  onConfirm,
  isProcessing,
}: AlternativePaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<"bank_transfer" | "on_site">(
    settings.methods[0] || "bank_transfer"
  );
  const [copied, setCopied] = useState(false);

  const handleCopyBankDetails = () => {
    const details = `Banque: ${settings.bank_details.bank_name}
Numéro de compte: ${settings.bank_details.account_number}
Nom du compte: ${settings.bank_details.account_name}
Montant: ${amount.toLocaleString()} FCFA
Référence: ${eventTitle}`;

    navigator.clipboard.writeText(details);
    setCopied(true);
    toast.success("Informations copiées !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    await onConfirm(selectedMethod);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choisir un mode de paiement</DialogTitle>
          <DialogDescription>
            Sélectionnez votre méthode de paiement préférée pour réserver votre place.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <RadioGroup
            value={selectedMethod}
            onValueChange={(value) => setSelectedMethod(value as "bank_transfer" | "on_site")}
            className="space-y-3"
          >
            {settings.methods.includes("bank_transfer") && (
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" className="mt-1" />
                <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                  <Card className={selectedMethod === "bank_transfer" ? "border-primary" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Virement bancaire</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Effectuez un virement et envoyez la preuve de paiement.
                      </p>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            )}

            {settings.methods.includes("on_site") && (
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="on_site" id="on_site" className="mt-1" />
                <Label htmlFor="on_site" className="flex-1 cursor-pointer">
                  <Card className={selectedMethod === "on_site" ? "border-primary" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Paiement sur place</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Payez directement à votre arrivée à l'événement.
                      </p>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            )}
          </RadioGroup>

          {/* Bank details section */}
          {selectedMethod === "bank_transfer" && settings.bank_details.bank_name && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Informations bancaires</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyBankDetails}
                    className="h-8"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Banque:</span> {settings.bank_details.bank_name}</p>
                  <p><span className="text-muted-foreground">N° compte:</span> {settings.bank_details.account_number}</p>
                  <p><span className="text-muted-foreground">Nom:</span> {settings.bank_details.account_name}</p>
                  <p className="font-semibold text-primary">Montant: {amount.toLocaleString()} FCFA</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {settings.instructions && (
            <p className="text-sm text-muted-foreground bg-accent/50 p-3 rounded-lg">
              {settings.instructions}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              "Confirmer la réservation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
