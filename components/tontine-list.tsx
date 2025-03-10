"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Users } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getTontines } from "@/lib/actions"
import { formatCurrency } from "@/lib/utils"

interface TontineListProps {
  type: "participating" | "available" | "moderated"
}

export default function TontineList({ type }: TontineListProps) {
  const { toast } = useToast()
  const [tontines, setTontines] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTontines = async () => {
      try {
        const data = await getTontines(type)
        setTontines(data)
      } catch (error) {
        console.error(`Erreur lors de la récupération des tontines ${type}:`, error)
        toast({
          title: "Erreur",
          description: `Impossible de charger les tontines ${type}.`,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTontines()
  }, [type, toast])

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-tontine-primary border-t-transparent"></div>
      </div>
    )
  }

  if (tontines.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <p className="text-muted-foreground mb-4">
            {type === "participating"
              ? "Vous n'avez pas encore rejoint de tontines."
              : type === "available"
                ? "Aucune tontine disponible à rejoindre pour le moment."
                : "Vous ne modérez aucune tontine."}
          </p>
          {type === "moderated" && (
            <Link href="/dashboard/create-tontine">
              <Button className="bg-tontine-primary hover:bg-tontine-primary/90">Créer une Tontine</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tontines.map((tontine) => {
        const jackpotAmount = tontine.stakeAmount * tontine.maxSubscriptions
        const isFull = tontine.participants.length >= tontine.maxSubscriptions

        // Déterminer la couleur de bordure en fonction de la fréquence
        const borderColorClass =
          tontine.frequency === "daily"
            ? "border-t-[#F97316]"
            : tontine.frequency === "weekly"
              ? "border-t-[#8B5CF6]"
              : "border-t-[#06B6D4]"

        // Classe pour le badge de fréquence
        const frequencyBadgeClass =
          tontine.frequency === "daily"
            ? "badge-daily"
            : tontine.frequency === "weekly"
              ? "badge-weekly"
              : "badge-monthly"

        return (
          <Card
            key={tontine.id}
            className={`tontine-card flex flex-col bg-white dark:bg-gray-800 shadow-md border-t-4 ${borderColorClass}`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{tontine.name}</CardTitle>
                <Badge variant={isFull ? "secondary" : "outline"} className={isFull ? "bg-gray-500" : ""}>
                  {isFull ? "Complète" : `${tontine.participants.length}/${tontine.maxSubscriptions}`}
                </Badge>
              </div>
              <CardDescription>{tontine.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 py-2">
              <div className="flex flex-col items-center">
                <DollarSign className="h-5 w-5 text-tontine-primary mb-1" />
                <span className="text-xs text-muted-foreground">Mise</span>
                <span className="font-medium">{formatCurrency(tontine.stakeAmount)}</span>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-5 w-5 text-tontine-secondary mb-1" />
                <span className="text-xs text-muted-foreground">Cagnotte</span>
                <span className="font-medium">{formatCurrency(jackpotAmount)}</span>
              </div>
              <div className="flex flex-col items-center">
                <Calendar className="h-5 w-5 text-tontine-accent mb-1" />
                <span className="text-xs text-muted-foreground">Fréquence</span>
                <span className={`font-medium capitalize px-2 py-0.5 rounded-full text-xs ${frequencyBadgeClass}`}>
                  {tontine.frequency === "daily"
                    ? "Quotidienne"
                    : tontine.frequency === "weekly"
                      ? "Hebdomadaire"
                      : "Mensuelle"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-4">
              <Link href={`/dashboard/tontine/${tontine.id}`} className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-tontine-primary text-tontine-primary hover:bg-tontine-primary/10"
                >
                  Voir les Détails
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

