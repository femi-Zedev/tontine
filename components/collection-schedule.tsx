"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, CheckCircle2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CollectionScheduleProps {
  tontine: any
}

export default function CollectionSchedule({ tontine }: CollectionScheduleProps) {
  // Créer un tableau de toutes les positions
  const allPositions = Array.from({ length: tontine.maxSubscriptions }, (_, i) => i + 1)

  // Associer les participants à leurs positions
  const participantsByPosition = tontine.participants.reduce((acc, participant) => {
    acc[participant.position] = participant
    return acc
  }, {})

  // Calculer les dates de collecte en fonction de la fréquence
  const getCollectionDate = (position) => {
    const startDate = new Date(tontine.createdAt)
    const nextDate = new Date(startDate)

    if (tontine.frequency === "daily") {
      nextDate.setDate(startDate.getDate() + position - 1)
    } else if (tontine.frequency === "weekly") {
      nextDate.setDate(startDate.getDate() + (position - 1) * 7)
    } else if (tontine.frequency === "monthly") {
      nextDate.setMonth(startDate.getMonth() + position - 1)
    }

    return nextDate
  }

  // Formater la date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Vérifier si la collecte a déjà eu lieu
  const isCollectionComplete = (date) => {
    return new Date() > date
  }

  const jackpotAmount = tontine.stakeAmount * tontine.maxSubscriptions

  // Déterminer la classe de badge en fonction de la fréquence
  const getBadgeClass = (isComplete) => {
    if (isComplete) {
      return tontine.frequency === "daily"
        ? "badge-daily"
        : tontine.frequency === "weekly"
          ? "badge-weekly"
          : "badge-monthly"
    }
    return ""
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-tontine-secondary">Calendrier de Collecte</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allPositions.map((position) => {
            const participant = participantsByPosition[position]
            const collectionDate = getCollectionDate(position)
            const isComplete = isCollectionComplete(collectionDate)
            const badgeClass = getBadgeClass(isComplete)

            return (
              <div
                key={position}
                className="flex items-center justify-between border-b pb-4 last:border-0 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Badge
                    variant={isComplete ? "default" : "outline"}
                    className={`w-8 h-8 rounded-full flex items-center justify-center p-0 ${isComplete ? badgeClass : "border-2"}`}
                  >
                    {position}
                  </Badge>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{participant ? participant.user.name : "Position Disponible"}</p>
                      {isComplete && <CheckCircle2 className="h-4 w-4 text-tontine-success" />}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {formatDate(collectionDate)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(jackpotAmount)}</p>
                  <p className="text-sm text-muted-foreground">Versement</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

