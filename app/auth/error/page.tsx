"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: { [key: string]: string } = {
    default: "Une erreur s'est produite lors de la connexion",
    configuration: "Il y a un problème avec la configuration de l'authentification",
    accessdenied: "L'accès a été refusé",
    verification: "Le lien de vérification a expiré ou a déjà été utilisé",
  }

  const message = error ? errorMessages[error] || errorMessages.default : errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">Erreur d'Authentification</CardTitle>
          <CardDescription className="text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/auth/signin">
            <Button>
              Retour à la page de connexion
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
