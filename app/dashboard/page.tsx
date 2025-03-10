"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import TontineList from "@/components/tontine-list"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("my-tontines")
  const userName = "Utilisateur Démo" // Nom d'utilisateur codé en dur au lieu d'utiliser la session

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground">Bienvenue, {userName}</p>
          </div>
          <Link href="/dashboard/create-tontine">
            <Button className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Créer une Tontine
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="my-tontines" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="my-tontines">Mes Tontines</TabsTrigger>
            <TabsTrigger value="available-tontines">Tontines Disponibles</TabsTrigger>
            <TabsTrigger value="moderated-tontines">Tontines Modérées</TabsTrigger>
          </TabsList>
          <TabsContent value="my-tontines" className="space-y-4">
            <TontineList type="participating" />
          </TabsContent>
          <TabsContent value="available-tontines" className="space-y-4">
            <TontineList type="available" />
          </TabsContent>
          <TabsContent value="moderated-tontines" className="space-y-4">
            <TontineList type="moderated" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
