"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/services/api"
import type { AnalyticsData } from "@/lib/types"

export function useAnalytics(params?: { startDate?: string; endDate?: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [params?.startDate, params?.endDate])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiService.getAnalytics(params)
      if (response.success && response.data) {
        setAnalytics(response.data as AnalyticsData)
      } else {
        setError(response.error || "Failed to fetch analytics")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  }
}
