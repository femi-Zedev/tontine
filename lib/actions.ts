"use server"

import { revalidatePath } from "next/cache"
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Create Supabase client for server actions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get current user from session
async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Vous devez être connecté pour effectuer cette action")
  }
  return session.user
}

// Get tontines based on type (participating, available, moderated)
export async function getTontines(type: string) {
  try {
    const user = await getCurrentUser()
    
    switch (type) {
      case "participating":
        // Get tontines where user is a participant
        const { data: participatingTontines, error: participatingError } = await supabase
          .from('tontine_members')
          .select(`
            tontine_id,
            position,
            tontines:tontine_id (
              id,
              name,
              description,
              stake_amount,
              max_subscriptions,
              frequency,
              created_by,
              created_at,
              is_private
            )
          `)
          .eq('user_id', user.id)
        
        if (participatingError) throw participatingError
        
        return participatingTontines.map(pt => ({
          ...pt.tontines,
          stakeAmount: pt.tontines.stake_amount,
          maxSubscriptions: pt.tontines.max_subscriptions,
          moderatorId: pt.tontines.created_by,
          createdAt: pt.tontines.created_at,
          isPrivate: pt.tontines.is_private
        }))
        
      case "available":
        // Get public tontines that user hasn't joined and isn't moderating
        const { data: availableTontines, error: availableError } = await supabase
          .from('tontines')
          .select('*')
          .eq('is_private', false)
          .neq('created_by', user.id)
          .not('id', 'in', (subquery) => {
            return subquery
              .from('tontine_members')
              .select('tontine_id')
              .eq('user_id', user.id)
          })
        
        if (availableError) throw availableError
        
        return availableTontines.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          stakeAmount: t.stake_amount,
          maxSubscriptions: t.max_subscriptions,
          frequency: t.frequency,
          moderatorId: t.created_by,
          createdAt: t.created_at,
          isPrivate: t.is_private,
          participants: []
        }))
        
      case "moderated":
        // Get tontines where user is the moderator
        const { data: moderatedTontines, error: moderatedError } = await supabase
          .from('tontines')
          .select('*')
          .eq('created_by', user.id)
        
        if (moderatedError) throw moderatedError
        
        return moderatedTontines.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          stakeAmount: t.stake_amount,
          maxSubscriptions: t.max_subscriptions,
          frequency: t.frequency,
          moderatorId: t.created_by,
          createdAt: t.created_at,
          isPrivate: t.is_private,
          participants: []
        }))
        
      default:
        return []
    }
  } catch (error) {
    console.error("Error fetching tontines:", error)
    return []
  }
}

// Get a single tontine by ID with participants
export async function getTontineById(id: string) {
  try {
    // Get tontine details
    const { data: tontine, error: tontineError } = await supabase
      .from('tontines')
      .select('*')
      .eq('id', id)
      .single()
    
    if (tontineError) throw tontineError
    if (!tontine) return null
    
    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('tontine_members')
      .select(`
        id,
        user_id,
        position,
        users:user_id (
          id,
          name,
          email,
          image
        )
      `)
      .eq('tontine_id', id)
    
    if (participantsError) throw participantsError
    
    return {
      id: tontine.id,
      name: tontine.name,
      description: tontine.description,
      stakeAmount: tontine.stake_amount,
      maxSubscriptions: tontine.max_subscriptions,
      frequency: tontine.frequency,
      moderatorId: tontine.created_by,
      createdAt: tontine.created_at,
      isPrivate: tontine.is_private,
      participants: participants.map(p => ({
        id: p.id,
        userId: p.user_id,
        position: p.position,
        user: p.users
      }))
    }
  } catch (error) {
    console.error("Error fetching tontine:", error)
    return null
  }
}

// Create a new tontine
export async function createTontine(data: {
  name: string
  description: string
  stakeAmount: number
  maxSubscriptions: number
  frequency: string
  isPrivate: boolean
}) {
  try {
    const user = await getCurrentUser()
    
    // Insert tontine into database
    const { data: newTontine, error } = await supabase
      .from('tontines')
      .insert({
        name: data.name,
        description: data.description,
        stake_amount: data.stakeAmount,
        max_subscriptions: data.maxSubscriptions,
        frequency: data.frequency,
        created_by: user.id,
        is_private: data.isPrivate
      })
      .select()
      .single()
    
    if (error) throw error
    
    revalidatePath("/dashboard")
    return newTontine
  } catch (error) {
    console.error("Error creating tontine:", error)
    throw new Error("Échec de la création de la tontine: " + (error as Error).message)
  }
}

// Join a tontine
export async function joinTontine(tontineId: string, position: number) {
  try {
    const user = await getCurrentUser()
    
    // Check if tontine exists and has space
    const { data: tontine, error: tontineError } = await supabase
      .from('tontines')
      .select('max_subscriptions, created_by')
      .eq('id', tontineId)
      .single()
    
    if (tontineError) throw tontineError
    if (!tontine) throw new Error("Tontine introuvable")
    if (tontine.created_by === user.id) throw new Error("Le modérateur ne peut pas rejoindre sa propre tontine")
    
    // Count current participants
    const { count, error: countError } = await supabase
      .from('tontine_members')
      .select('*', { count: 'exact', head: true })
      .eq('tontine_id', tontineId)
    
    if (countError) throw countError
    if (count && count >= tontine.max_subscriptions) throw new Error("La tontine est complète")
    
    // Check if position is available
    const { data: positionCheck, error: positionError } = await supabase
      .from('tontine_members')
      .select('id')
      .eq('tontine_id', tontineId)
      .eq('position', position)
    
    if (positionError) throw positionError
    if (positionCheck && positionCheck.length > 0) throw new Error("Position déjà prise")
    
    // Add user to tontine
    const { data: participation, error: participationError } = await supabase
      .from('tontine_members')
      .insert({
        tontine_id: tontineId,
        user_id: user.id,
        position: position
      })
      .select()
      .single()
    
    if (participationError) throw participationError
    
    revalidatePath("/dashboard")
    return participation
  } catch (error) {
    console.error("Error joining tontine:", error)
    throw new Error("Échec de l'inscription à la tontine: " + (error as Error).message)
  }
}
