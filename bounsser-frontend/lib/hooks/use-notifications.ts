"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/services/api"
import type { Notification, PaginatedResponse } from "@/lib/types"

export function useNotifications(params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [params?.page, params?.pageSize, params?.unreadOnly])

  const fetchNotifications = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiService.getNotifications(params)
      if (response.success && response.data) {
        const data = response.data as PaginatedResponse<Notification>
        setNotifications(data.data)
        setUnreadCount(data.data.filter((n) => !n.isRead).length)
      } else {
        setError(response.error || "Failed to fetch notifications")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await apiService.markNotificationAsRead(id)
      if (response.success) {
        await fetchNotifications()
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to mark as read" }
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead()
      if (response.success) {
        await fetchNotifications()
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to mark all as read" }
    }
  }

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
