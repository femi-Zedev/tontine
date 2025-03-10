"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface TransactionHistoryProps {
  tontine: any
}

export default function TransactionHistory({ tontine }: TransactionHistoryProps) {
  // Pour les besoins de la démo, nous allons générer des transactions fictives
  // Dans une application réelle, elles proviendraient de la base de données
  const mockTransactions = [
    {
      id: "tx1",
      type: "contribution",
      amount: tontine.stakeAmount,
      userId: "user1",
      userName: "Jean Dupont",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // il y a 7 jours
      status: "completed",
    },
    {
      id: "tx2",
      type: "contribution",
      amount: tontine.stakeAmount,
      userId: "user2",
      userName: "Marie Martin",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // il y a 6 jours
      status: "completed",
    },
    {
      id: "tx3",
      type: "payout",
      amount: tontine.stakeAmount * 2, // En supposant 2 participants jusqu'à présent
      userId: "user1",
      userName: "Jean Dupont",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // il y a 3 jours
      status: "completed",
    },
  ]

  // Trier les transactions par date (les plus récentes d'abord)
  const sortedTransactions = [...mockTransactions].sort((a, b) => b.date.getTime() - a.date.getTime())

  // Formater la date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{transaction.userName}</p>
                    <Badge variant={transaction.type === "payout" ? "default" : "outline"}>
                      {transaction.type === "payout" ? "Versement" : "Contribution"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${transaction.type === "payout" ? "text-green-600" : ""}`}>
                    {transaction.type === "payout" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <Badge variant={transaction.status === "completed" ? "outline" : "secondary"} className="text-xs">
                    {transaction.status === "completed" ? "Terminée" : "En cours"}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">Pas encore de transactions</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

