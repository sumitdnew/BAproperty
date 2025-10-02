import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

interface AccessibleBuilding {
  id: string
  name: string
}

interface BuildingContextValue {
  buildings: AccessibleBuilding[]
  selectedBuildingId: string | 'all'
  selectedBuilding: AccessibleBuilding | null
  setSelectedBuildingId: (id: string | 'all') => void
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const BuildingContext = createContext<BuildingContextValue | undefined>(undefined)

export const BuildingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buildings, setBuildings] = useState<AccessibleBuilding[]>([])
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | 'all'>('all')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadBuildings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const userId = sessionData.session?.user?.id
      if (!userId) {
        setBuildings([])
        setSelectedBuildingId('all')
        return
      }

      let mapped: AccessibleBuilding[] = []

      // First, try to get buildings from admin_building_access (for admins)
      const { data: accessData, error: accessError } = await supabase
        .from('admin_building_access')
        .select('building_id, buildings ( id, name )')
        .eq('admin_id', userId)

      if (accessData && accessData.length > 0) {
        // User has admin access to specific buildings
        mapped = accessData
          .map((row: any) => ({ id: row.buildings?.id || row.building_id, name: row.buildings?.name || 'Building' }))
          .filter((b: AccessibleBuilding) => Boolean(b.id))
      } else {
        // Check if user is a tenant and get their building
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('apartment_id, apartments ( building_id, buildings ( id, name ) )')
          .eq('user_id', userId)
          .single()

        if (tenantData && tenantData.apartments?.[0]?.buildings) {
          // User is a tenant, show only their building
          mapped = [{
            id: tenantData.apartments[0].buildings[0].id,
            name: tenantData.apartments[0].buildings[0].name
          }]
        } else {
          // Fallback: load all buildings (for testing/development only)
          console.log('No specific building access found, loading all buildings (development mode)')
          const { data: allBuildings, error: buildingsError } = await supabase
            .from('buildings')
            .select('id, name')
            .limit(10)

          if (buildingsError) {
            console.error('Error loading all buildings:', buildingsError)
          } else {
            mapped = allBuildings || []
          }
        }
      }

      setBuildings(mapped)

      // If previously selected building is no longer in list, reset to 'all' or first
      if (mapped.length === 0) {
        setSelectedBuildingId('all')
      } else if (mapped.length === 1) {
        // If user only has access to one building (like a tenant), auto-select it
        setSelectedBuildingId(mapped[0].id)
      } else if (selectedBuildingId !== 'all' && !mapped.find(b => b.id === selectedBuildingId)) {
        setSelectedBuildingId(mapped[0].id)
      }
    } catch (e: any) {
      console.error('Error in loadBuildings:', e)
      setError(e?.message || 'Failed to load buildings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBuildings()
  }, [])

  const selectedBuilding = useMemo(() => {
    if (selectedBuildingId === 'all') return null
    return buildings.find(b => b.id === selectedBuildingId) || null
  }, [buildings, selectedBuildingId])

  const value = useMemo<BuildingContextValue>(() => ({
    buildings,
    selectedBuildingId,
    selectedBuilding,
    setSelectedBuildingId,
    loading,
    error,
    refresh: loadBuildings
  }), [buildings, selectedBuildingId, selectedBuilding, loading, error])

  return (
    <BuildingContext.Provider value={value}>
      {children}
    </BuildingContext.Provider>
  )
}

export const useBuildingContext = (): BuildingContextValue => {
  const ctx = useContext(BuildingContext)
  if (!ctx) throw new Error('useBuildingContext must be used within BuildingProvider')
  return ctx
}


