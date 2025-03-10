"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ParticipantsListProps {
  tontine: any
}

export default function ParticipantsList({ tontine }: ParticipantsListProps) {
  // Trier les participants par position
  const sortedParticipants = [...tontine.participants].sort((a, b) => a.position - b.position)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Participants ({sortedParticipants.length}/{tontine.maxSubscriptions})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedParticipants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={participant.user.image || "/placeholder.svg?height=40&width=40"} />
                  <AvatarFallback>{participant.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{participant.user.name}</p>
                  <p className="text-sm text-muted-foreground">{participant.user.email}</p>
                </div>
              </div>
              <Badge>Position {participant.position}</Badge>
            </div>
          ))}

          {sortedParticipants.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Pas encore de participants</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

