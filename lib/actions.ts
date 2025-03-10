"use server"

import { revalidatePath } from "next/cache"

// ID utilisateur fictif pour la démo (puisque nous avons supprimé l'authentification)
const MOCK_USER_ID = "demo-user-123"

// Données fictives à des fins de démonstration
// Dans une application réelle, cela interagirait avec une base de données

const mockTontines = [
  {
    id: "1",
    name: "Groupe d'Épargne Mensuel",
    description: "Une tontine mensuelle pour l'épargne régulière",
    stakeAmount: 50000,
    maxSubscriptions: 10,
    frequency: "monthly",
    moderatorId: "mod1",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // il y a 30 jours
    participants: [
      {
        id: "p1",
        userId: "user1",
        position: 1,
        user: {
          id: "user1",
          name: "Jean Dupont",
          email: "jean@exemple.com",
          image: "/placeholder.svg?height=40&width=40",
        },
      },
      {
        id: "p2",
        userId: "user2",
        position: 3,
        user: {
          id: "user2",
          name: "Marie Martin",
          email: "marie@exemple.com",
          image: "/placeholder.svg?height=40&width=40",
        },
      },
    ],
  },
  {
    id: "2",
    name: "Club d'Investissement Hebdomadaire",
    description: "Investissez ensemble sur une base hebdomadaire",
    stakeAmount: 25000,
    maxSubscriptions: 8,
    frequency: "weekly",
    moderatorId: "mod2",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // il y a 14 jours
    participants: [
      {
        id: "p3",
        userId: "user3",
        position: 2,
        user: {
          id: "user3",
          name: "Alice Johnson",
          email: "alice@exemple.com",
          image: "/placeholder.svg?height=40&width=40",
        },
      },
    ],
  },
  {
    id: "3",
    name: "Tontine de Démonstration",
    description: "Une tontine à des fins de démonstration",
    stakeAmount: 10000,
    maxSubscriptions: 5,
    frequency: "weekly",
    moderatorId: MOCK_USER_ID, // Celle-ci est modérée par l'utilisateur de démo
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // il y a 7 jours
    participants: [
      {
        id: "p4",
        userId: "user4",
        position: 1,
        user: {
          id: "user4",
          name: "Robert Williams",
          email: "robert@exemple.com",
          image: "/placeholder.svg?height=40&width=40",
        },
      },
    ],
  },
  {
    id: "4",
    name: "Tontine Participative",
    description: "Une tontine où l'utilisateur de démo participe",
    stakeAmount: 15000,
    maxSubscriptions: 6,
    frequency: "monthly",
    moderatorId: "mod3",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // il y a 10 jours
    participants: [
      {
        id: "p5",
        userId: MOCK_USER_ID, // L'utilisateur de démo participe à celle-ci
        position: 2,
        user: {
          id: MOCK_USER_ID,
          name: "Utilisateur Démo",
          email: "demo@exemple.com",
          image: "/placeholder.svg?height=40&width=40",
        },
      },
    ],
  },
]

// Obtenir les tontines en fonction du type (participating, available, moderated)
export async function getTontines(type: string) {
  // Simuler un délai d'API
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Filtrer en fonction de l'ID utilisateur fictif
  switch (type) {
    case "participating":
      return mockTontines.filter((tontine) => tontine.participants.some((p) => p.userId === MOCK_USER_ID))
    case "available":
      return mockTontines.filter(
        (tontine) =>
          tontine.participants.length < tontine.maxSubscriptions &&
          !tontine.participants.some((p) => p.userId === MOCK_USER_ID) &&
          tontine.moderatorId !== MOCK_USER_ID,
      )
    case "moderated":
      return mockTontines.filter((tontine) => tontine.moderatorId === MOCK_USER_ID)
    default:
      return mockTontines
  }
}

// Obtenir une seule tontine par ID
export async function getTontineById(id: string) {
  // Simuler un délai d'API
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockTontines.find((tontine) => tontine.id === id) || null
}

// Créer une nouvelle tontine
export async function createTontine(data: any) {
  // Simuler un délai d'API
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newTontine = {
    id: `${mockTontines.length + 1}`,
    ...data,
    moderatorId: MOCK_USER_ID, // Utiliser l'ID utilisateur fictif
    createdAt: new Date(),
    participants: [],
  }

  mockTontines.push(newTontine)
  revalidatePath("/dashboard")

  return newTontine
}

// Rejoindre une tontine
export async function joinTontine(tontineId: string, position: number) {
  // Simuler un délai d'API
  await new Promise((resolve) => setTimeout(resolve, 800))

  const tontine = mockTontines.find((t) => t.id === tontineId)

  if (!tontine) {
    throw new Error("Tontine introuvable")
  }

  if (tontine.participants.length >= tontine.maxSubscriptions) {
    throw new Error("La tontine est complète")
  }

  if (tontine.participants.some((p) => p.position === position)) {
    throw new Error("Position déjà prise")
  }

  const newParticipant = {
    id: `p${Date.now()}`,
    userId: MOCK_USER_ID, // Utiliser l'ID utilisateur fictif
    position,
    user: {
      id: MOCK_USER_ID,
      name: "Utilisateur Démo",
      email: "demo@exemple.com",
      image: "/placeholder.svg?height=40&width=40",
    },
  }

  tontine.participants.push(newParticipant)
  revalidatePath(`/dashboard/tontine/${tontineId}`)
  revalidatePath("/dashboard")

  return newParticipant
}

