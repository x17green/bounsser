"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/services/api"
import type { ImpersonationEvent, PaginatedResponse } from "@/lib/types"

export function useEvents(params?: { page?: number; pageSize?: number; status?: string }) {
  const [events, setEvents] = useState<ImpersonationEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    hasMore: false,
  })

  useEffect(() => {
    fetchEvents()
  }, [params?.page, params?.pageSize, params?.status])

  const fetchEvents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiService.getEvents(params)
      if (response.success && response.data) {
        const data = response.data as PaginatedResponse<ImpersonationEvent>
        setEvents(data.data)
        setPagination({
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
          hasMore: data.hasMore,
        })
      } else {
        setError(response.error || "Failed to fetch events")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events")
    } finally {
      setIsLoading(false)
    }
  }

  const reviewEvent = async (id: string, action: "confirm" | "dismiss", notes?: string) => {
    try {
      const response = await apiService.reviewEvent(id, action, notes)
      if (response.success) {
        await fetchEvents()
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Review failed" }
    }
  }

  return {
    events,
    isLoading,
    error,
    pagination,
    refetch: fetchEvents,
    reviewEvent,
  }
}
