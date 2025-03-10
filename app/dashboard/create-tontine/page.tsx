"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { createTontine } from "@/lib/actions";

export default function CreateTontine() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stakeAmount: "",
    maxSubscriptions: "",
    frequency: "monthly",
    isPrivate: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convertir les valeurs de chaîne en nombres si nécessaire
      const payload = {
        ...formData,
        stakeAmount: Number.parseFloat(formData.stakeAmount),
        maxSubscriptions: Number.parseInt(formData.maxSubscriptions, 10),
      };

      await createTontine(payload);

      toast({
        title: "Tontine Créée",
        description: "Votre tontine a été créée avec succès.",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur lors de la création de la tontine:", error);
      toast({
        title: "Erreur",
        description: "Échec de la création de la tontine. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-tontine-primary to-tontine-secondary">
            Créer une Nouvelle Tontine
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Détails de la Tontine</CardTitle>
              <CardDescription>
                Configurez les paramètres de votre nouvelle tontine. En tant que
                modérateur, vous ne pourrez pas participer à cette tontine.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la Tontine</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Entrez un nom pour votre tontine"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Décrivez brièvement cette tontine"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stakeAmount">
                      Montant de la Mise (F CFA)
                    </Label>
                    <Input
                      id="stakeAmount"
                      name="stakeAmount"
                      type="number"
                      placeholder="ex: 50000"
                      value={formData.stakeAmount}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxSubscriptions">
                      Nombre Maximum de Souscriptions
                    </Label>
                    <Input
                      id="maxSubscriptions"
                      name="maxSubscriptions"
                      type="number"
                      placeholder="ex: 10"
                      value={formData.maxSubscriptions}
                      onChange={handleChange}
                      min="2"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Fréquence de Collecte</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) =>
                      handleSelectChange("frequency", value)
                    }
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Sélectionner la fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPrivate"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) =>
                      handleSelectChange("isPrivate", checked)
                    }
                  />
                  <Label htmlFor="isPrivate">Tontine Privée</Label>
                  <p className="text-sm text-muted-foreground ml-2">
                    (Une tontine privée n'apparaîtra pas dans la liste publique)
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  className="border-tontine-primary text-tontine-primary hover:bg-tontine-primary/10"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Création en cours..." : "Créer la Tontine"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
