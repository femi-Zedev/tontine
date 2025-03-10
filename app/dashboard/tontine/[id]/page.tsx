"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTontineById, joinTontine } from "@/lib/actions";
import ParticipantsList from "@/components/participants-list";
import CollectionSchedule from "@/components/collection-schedule";
import TransactionHistory from "@/components/transaction-history";
import ShareTontineButton from "@/components/share-tontine-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";

// ID utilisateur fictif pour la démo (puisque nous avons supprimé l'authentification)
const MOCK_USER_ID = "demo-user-123";

export default function TontineDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [tontine, setTontine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const id = params.id;

  useEffect(() => {
    const fetchTontine = async () => {
      try {
        const data = await getTontineById(id);
        setTontine(data);
      } catch (error) {
        console.error("Erreur lors de la récupération de la tontine:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de la tontine.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTontine();
    }
  }, [id, toast]);

  const handleJoin = async () => {
    if (!selectedPosition) {
      toast({
        title: "Position Requise",
        description: "Veuillez sélectionner une position dans la tontine.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      await joinTontine(id, selectedPosition);
      toast({
        title: "Succès",
        description: "Vous avez rejoint la tontine avec succès.",
      });
      // Actualiser les données de la tontine
      const updatedTontine = await getTontineById(id);
      setTontine(updatedTontine);
    } catch (error) {
      console.error("Erreur lors de l'adhésion à la tontine:", error);
      toast({
        title: "Erreur",
        description: "Échec de l'adhésion à la tontine. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-tontine-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!tontine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-4">Tontine introuvable</h1>
        <Button onClick={() => router.push("/dashboard")} className="bg-tontine-primary hover:bg-tontine-primary/90">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au Tableau de bord
        </Button>
      </div>
    )
  }

  // Calculer les positions disponibles
  const takenPositions = tontine.participants.map((p) => p.position);
  const availablePositions = Array.from(
    { length: tontine.maxSubscriptions },
    (_, i) => i + 1
  ).filter((pos) => !takenPositions.includes(pos));

  const jackpotAmount = tontine.stakeAmount * tontine.maxSubscriptions;
  const isFull = tontine.participants.length >= tontine.maxSubscriptions;
  const userIsParticipant = tontine.participants.some(
    (p) => p.userId === MOCK_USER_ID
  );
  const userIsModerator = tontine.moderatorId === MOCK_USER_ID;

  // Déterminer les couleurs en fonction de la fréquence
  const frequencyColor =
    tontine.frequency === "daily"
      ? "text-[#F97316]"
      : tontine.frequency === "weekly"
      ? "text-[#8B5CF6]"
      : "text-[#06B6D4]";

  const frequencyBadgeClass =
    tontine.frequency === "daily"
      ? "badge-daily"
      : tontine.frequency === "weekly"
      ? "badge-weekly"
      : "badge-monthly";

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6 md:p-10 bg-gray-50 dark:bg-gray-900">
      <Button
          variant="outline"
          className="mb-6 border-tontine-primary text-tontine-primary hover:bg-tontine-primary/10"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au Tableau de bord
        </Button>

        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-tontine-primary to-tontine-secondary">
                  {tontine.name}
                </h1>
                <Badge
                  variant={isFull ? "secondary" : "outline"}
                  className={isFull ? "bg-gray-500" : ""}
                >
                  {isFull
                    ? "Complète"
                    : `${tontine.participants.length}/${tontine.maxSubscriptions} Souscriptions`}
                </Badge>
              </div>
              <p className="text-muted-foreground">{tontine.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <ShareTontineButton tontineId={id} isPrivate={tontine.isPrivate} />
              {!userIsModerator && !userIsParticipant && !isFull && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          onClick={handleJoin}
                          disabled={isJoining || !selectedPosition}
                          className="bg-tontine-primary hover:bg-tontine-primary/90"
                        >
                          {isJoining ? "Adhésion en cours..." : "Rejoindre la Tontine"}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Vous devez choisir une position pour rejoindre la tontine !</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white dark:bg-gray-800 shadow-md border-t-4 border-t-tontine-primary">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <DollarSign className="h-8 w-8 text-tontine-primary" />
                <div>
                  <CardTitle>Montant de la Mise</CardTitle>
                  <CardDescription>Par souscription</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(tontine.stakeAmount)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-md border-t-4 border-t-tontine-secondary">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Users className="h-8 w-8 text-tontine-secondary" />
                <div>
                  <CardTitle>Cagnotte</CardTitle>
                  <CardDescription>Total par tour</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(jackpotAmount)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-md border-t-4 border-t-tontine-accent">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Calendar className={`h-8 w-8 ${frequencyColor}`} />
                <div>
                  <CardTitle>Fréquence</CardTitle>
                  <CardDescription>Calendrier de collecte</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p
                  className={`inline-block px-3 py-1 rounded-full ${frequencyBadgeClass}`}
                >
                  {tontine.frequency === "daily"
                    ? "Quotidienne"
                    : tontine.frequency === "weekly"
                    ? "Hebdomadaire"
                    : "Mensuelle"}
                </p>
              </CardContent>
            </Card>
          </div>

          {!userIsModerator && !userIsParticipant && !isFull && (
            <Card className="mb-6 bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <CardTitle>Rejoindre cette Tontine</CardTitle>
                <CardDescription>
                  Sélectionnez votre position préférée dans le calendrier de
                  collecte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {availablePositions.map((position) => (
                    <Button
                      key={position}
                      variant={
                        selectedPosition === position ? "default" : "outline"
                      }
                      className={`h-12 w-full ${
                        selectedPosition === position
                          ? "bg-tontine-primary hover:bg-tontine-primary/90"
                          : "border-tontine-primary text-tontine-primary hover:bg-tontine-primary/10"
                      }`}
                      onClick={() => setSelectedPosition(position)}
                    >
                      Position {position}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="participants" className="space-y-4">
            <TabsList className="bg-white dark:bg-gray-800 p-1">
              <TabsTrigger
                value="participants"
                className="data-[state=active]:bg-tontine-primary data-[state=active]:text-white"
              >
                Participants
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="data-[state=active]:bg-tontine-secondary data-[state=active]:text-white"
              >
                Calendrier de Collecte
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-tontine-accent data-[state=active]:text-white"
              >
                Historique des Transactions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="participants" className="space-y-4">
              <ParticipantsList tontine={tontine} />
            </TabsContent>
            <TabsContent value="schedule" className="space-y-4">
              <CollectionSchedule tontine={tontine} />
            </TabsContent>
            <TabsContent value="transactions" className="space-y-4">
              <TransactionHistory tontine={tontine} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
