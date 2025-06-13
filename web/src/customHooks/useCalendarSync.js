import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  updateCardInBoard,
  updateCardDueDate,
  syncCalendarToBoard,
  selectCardsWithDueDate,
  selectCardById
} from '~/redux/activeBoard/activeBoardSlice'
import {
  updateActiveCardDueDate,
  rollbackActiveCardDueDate,
  selectCurrentActiveCard,
  updateCurrentActiveCard
} from '~/redux/activeCard/activeCardSlice'
import { updateCardDueDateAPI } from '~/apis'
import { toast } from 'react-toastify'

/**
 * Custom hook for managing synchronization between calendar and board state
 * Handles due date updates, optimistic updates, and error rollbacks
 */
export const useCalendarSync = () => {
  const dispatch = useDispatch()
  const currentActiveCard = useSelector(selectCurrentActiveCard)
  const cardsWithDueDate = useSelector(selectCardsWithDueDate)

  // Update due date with optimistic update and error handling
  const updateDueDate = useCallback(async (cardId, newDueDate, options = {}) => {
    const {
      optimistic = true,
      showToast = true,
      source = 'unknown'
    } = options

    try {
      console.log(`🔄 Starting due date update for card ${cardId} from ${source}`)

      // Optimistic update - update Redux state immediately
      if (optimistic) {
        dispatch(updateCardDueDate({ cardId, dueDate: newDueDate }))

        // If this card is currently active, update active card state too
        if (currentActiveCard?._id === cardId) {
          dispatch(updateActiveCardDueDate({ dueDate: newDueDate }))
        }
      }

      // Call API to update backend
      const response = await updateCardDueDateAPI(cardId, newDueDate)

      if (!optimistic) {
        // Non-optimistic update - only update state after successful API call
        dispatch(updateCardInBoard(response))

        if (currentActiveCard?._id === cardId) {
          dispatch(updateCurrentActiveCard(response))
        }
      }

      if (showToast) {
        toast.success('Due date updated successfully')
      }

      console.log(`✅ Due date update completed for card ${cardId}`)
      return response

    } catch (error) {
      console.error(`❌ Failed to update due date for card ${cardId}:`, error)

      // Rollback optimistic update on error
      if (optimistic) {
        // For board state - we need to find the original card and restore its due date
        // This is a simple rollback, in a real app you might want to store the previous state
        console.log('🔄 Rolling back optimistic update...')

        if (currentActiveCard?._id === cardId) {
          dispatch(rollbackActiveCardDueDate())
        }
      }

      if (showToast) {
        toast.error(`Failed to update due date: ${error.message}`)
      }

      throw error
    }
  }, [dispatch, currentActiveCard])

  // Sync multiple cards (useful for batch operations)
  const syncMultipleCards = useCallback(async (cardUpdates) => {
    try {
      console.log(`🔄 Syncing ${cardUpdates.length} cards...`)

      // Optimistic update
      dispatch(syncCalendarToBoard({ cardUpdates }))

      // API calls for each card
      const promises = cardUpdates.map(({ cardId, updates }) =>
        updateCardDueDateAPI(cardId, updates.dueDate)
      )

      await Promise.all(promises)
      console.log('✅ Batch sync completed')

    } catch (error) {
      console.error('❌ Batch sync failed:', error)
      // In a real app, you'd want to rollback all changes
      toast.error('Failed to sync some cards')
      throw error
    }
  }, [dispatch])

  // Get card by ID with column info
  const getCardById = useCallback((cardId) => {
    return selectCardById(cardId)
  }, [])

  // Check if calendar needs refresh
  const shouldRefreshCalendar = useCallback((lastUpdated) => {
    // Simple check - in a real app you might want more sophisticated logic
    return !lastUpdated || (Date.now() - lastUpdated) > 3000 // 3 seconds
  }, [])

  // Trigger calendar refresh notification
  const triggerCalendarRefresh = useCallback(() => {
    // This could dispatch an action to notify calendar to refresh
    console.log('🔔 Calendar refresh triggered from sync hook')
    // In the future, we could implement a more sophisticated notification system
  }, [])

  return {
    // Core functions
    updateDueDate,
    syncMultipleCards,
    getCardById,
    shouldRefreshCalendar,
    triggerCalendarRefresh,

    // Selectors
    cardsWithDueDate,
    currentActiveCard,

    // State indicators
    isActiveCardOpen: !!currentActiveCard
  }
}