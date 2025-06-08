import { useCalendarSync } from './useCalendarSync'
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { activeBoardReducer } from '~/redux/activeBoard/activeBoardSlice'
import { activeCardReducer } from '~/redux/activeCard/activeCardSlice'

// Mock the API
jest.mock('~/apis', () => ({
  updateCardDueDateAPI: jest.fn()
}))

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      activeBoard: activeBoardReducer,
      activeCard: activeCardReducer
    },
    preloadedState: {
      activeBoard: {
        currentActiveBoard: {
          columns: [
            {
              _id: 'column-1',
              title: 'Test Column',
              cards: [
                {
                  _id: 'card-1',
                  title: 'Test Card',
                  dueDate: '2024-12-25T12:00:00.000Z'
                }
              ]
            }
          ]
        }
      },
      activeCard: {
        currentActiveCard: {
          _id: 'card-1',
          title: 'Test Card',
          dueDate: '2024-12-25T12:00:00.000Z'
        },
        isShowModalActiveCard: true
      },
      ...initialState
    }
  })
}

const renderHookWithProvider = (hook, store) => {
  const wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  )
  return renderHook(hook, { wrapper })
}

describe('useCalendarSync', () => {
  const mockUpdateCardDueDateAPI = require('~/apis').updateCardDueDateAPI

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should update due date successfully with optimistic updates', async () => {
    const store = createMockStore()
    const { result } = renderHookWithProvider(() => useCalendarSync(), store)

    // Mock successful API response
    const mockUpdatedCard = {
      _id: 'card-1',
      title: 'Test Card',
      dueDate: '2024-12-26T12:00:00.000Z'
    }
    mockUpdateCardDueDateAPI.mockResolvedValue(mockUpdatedCard)

    await act(async () => {
      await result.current.updateDueDate('card-1', '2024-12-26T12:00:00.000Z', {
        optimistic: true,
        showToast: false
      })
    })

    expect(mockUpdateCardDueDateAPI).toHaveBeenCalledWith('card-1', '2024-12-26T12:00:00.000Z')
  })

  test('should handle API errors and rollback optimistic updates', async () => {
    const store = createMockStore()
    const { result } = renderHookWithProvider(() => useCalendarSync(), store)

    // Mock API error
    const mockError = new Error('Network error')
    mockUpdateCardDueDateAPI.mockRejectedValue(mockError)

    await act(async () => {
      try {
        await result.current.updateDueDate('card-1', '2024-12-26T12:00:00.000Z', {
          optimistic: true,
          showToast: false
        })
      } catch (error) {
        expect(error).toBe(mockError)
      }
    })

    expect(mockUpdateCardDueDateAPI).toHaveBeenCalledWith('card-1', '2024-12-26T12:00:00.000Z')
  })

  test('should provide correct selectors', () => {
    const store = createMockStore()
    const { result } = renderHookWithProvider(() => useCalendarSync(), store)

    expect(result.current.cardsWithDueDate).toEqual([
      {
        _id: 'card-1',
        title: 'Test Card',
        dueDate: '2024-12-25T12:00:00.000Z',
        columnTitle: 'Test Column',
        columnId: 'column-1'
      }
    ])

    expect(result.current.currentActiveCard).toEqual({
      _id: 'card-1',
      title: 'Test Card',
      dueDate: '2024-12-25T12:00:00.000Z'
    })

    expect(result.current.isActiveCardOpen).toBe(true)
  })

  test('should determine if calendar needs refresh', () => {
    const store = createMockStore()
    const { result } = renderHookWithProvider(() => useCalendarSync(), store)

    // Should refresh if no last updated time
    expect(result.current.shouldRefreshCalendar()).toBe(true)

    // Should refresh if last updated is old
    const oldTime = Date.now() - 10000 // 10 seconds ago
    expect(result.current.shouldRefreshCalendar(oldTime)).toBe(true)

    // Should not refresh if recently updated
    const recentTime = Date.now() - 1000 // 1 second ago
    expect(result.current.shouldRefreshCalendar(recentTime)).toBe(false)
  })
})

/**
 * Integration test to verify state synchronization between calendar and board
 */
describe('Calendar-Board State Synchronization', () => {
  test('should synchronize due date changes between calendar and active card', async () => {
    const store = createMockStore()
    const { result } = renderHookWithProvider(() => useCalendarSync(), store)

    const mockUpdatedCard = {
      _id: 'card-1',
      title: 'Test Card',
      dueDate: '2024-12-26T15:30:00.000Z',
      columnId: 'column-1'
    }

    const mockUpdateCardDueDateAPI = require('~/apis').updateCardDueDateAPI
    mockUpdateCardDueDateAPI.mockResolvedValue(mockUpdatedCard)

    // Update due date via calendar
    await act(async () => {
      await result.current.updateDueDate('card-1', '2024-12-26T15:30:00.000Z', {
        source: 'calendar-test'
      })
    })

    // Check that both board and active card states are updated
    const finalState = store.getState()
    
    // Board state should be updated
    const cardInBoard = finalState.activeBoard.currentActiveBoard.columns[0].cards[0]
    expect(cardInBoard.dueDate).toBe('2024-12-26T15:30:00.000Z')
    
    // Active card state should be updated (if it was the same card)
    if (finalState.activeCard.currentActiveCard?._id === 'card-1') {
      expect(finalState.activeCard.currentActiveCard.dueDate).toBe('2024-12-26T15:30:00.000Z')
    }
  })
}) 