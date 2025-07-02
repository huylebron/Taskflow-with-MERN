import { useState, useEffect, useMemo, useRef } from 'react'
import { Box, Typography, Paper, Chip, Stack, useTheme, useMediaQuery, CircularProgress, Alert, Snackbar, Breadcrumbs, Button } from '@mui/material'
import { CalendarMonth, CalendarViewWeek, CalendarToday, ArrowBack, Home, Dashboard, Refresh } from '@mui/icons-material'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'

// Import real API functions instead of mock data
import { fetchCardsWithDueDateAPI, updateCardDueDateAPI } from '~/apis'
import { processCalendarData } from '~/utils/calendarHelpers'

// Import visual constants for consistent styling
import {
  getDueDateStatus,
  getDueDateColor,
  getCalendarEventStyles,
  getUrgencyText,
  DUE_DATE_STATUS
} from '~/utils/dueDateConstants'

// Import ActiveCard modal components
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import {
  updateCurrentActiveCard,
  showModalActiveCard,
  selectCurrentActiveCard,
  selectIsShowModalActiveCard
} from '~/redux/activeCard/activeCardSlice'

// Import board selector and calendar sync hook
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useCalendarSync } from '~/customHooks/useCalendarSync'
import { socketIoInstance } from '~/socketClient'

// Enhanced Vietnamese locale configuration for FullCalendar
const vietnameseLocaleConfig = {
  code: 'vi',
  week: {
    dow: 1, // Monday is the first day of the week
    doy: 4  // The week that contains Jan 4th is the first week of the year
  },
  buttonText: {
    prev: 'Trước',
    next: 'Sau',
    today: 'Hôm nay',
    year: 'Năm',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    list: 'Danh sách'
  },
  allDayText: 'Cả ngày',
  moreLinkText: 'thêm',
  noEventsText: 'Không có sự kiện',
  monthNames: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ],
  monthNamesShort: [
    'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
    'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
  ],
  dayNames: [
    'Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'
  ],
  dayNamesShort: [
    'CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'
  ]
}

function Calendar() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { boardId } = useParams()

  // Calendar ref for direct method calls
  const calendarRef = useRef(null)

  // Redux selectors for ActiveCard modal and board data
  const currentActiveCard = useSelector(selectCurrentActiveCard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const currentActiveBoard = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser)

  // Use calendar synchronization hook
  const {
    updateDueDate,
    cardsWithDueDate,
    shouldRefreshCalendar
  } = useCalendarSync()

  // Determine if this is board-specific calendar
  const isBoardCalendar = Boolean(boardId)
  const boardTitle = isBoardCalendar ? (currentActiveBoard?.title || 'Board') : null

  console.log('📅 Calendar Route Info:', {
    boardId,
    isBoardCalendar,
    boardTitle,
    currentActiveBoard: currentActiveBoard?.title,
    pathname: window.location.pathname
  })

  // State management
  const [currentView, setCurrentView] = useState(() => {
    if (isMobile) return 'timeGridDay'
    if (isTablet) return 'timeGridWeek'
    return 'dayGridMonth'
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })
  const [calendarData, setCalendarData] = useState({
    events: [],
    labels: [],
    users: [],
    totalCards: 0,
    board: null
  })
  const [lastFetchTime, setLastFetchTime] = useState(null)

  // Extract calendar data properties
  const { events, labels, users, totalCards, board } = calendarData

  // Fetch calendar data from API
  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Prepare API filters
      const filters = {}
      if (isBoardCalendar && boardId) {
        filters.boardId = boardId
      }

      console.log('🔄 Fetching calendar data with filters:', filters)

      // Fetch cards with due dates from API
      const cardsWithDueDates = await fetchCardsWithDueDateAPI(filters)

      console.log('📅 Received calendar data:', cardsWithDueDates)

      // Handle empty or invalid response
      if (!cardsWithDueDates) {
        console.warn('No data received from API')
        setCalendarData({ events: [], labels: [], users: [], totalCards: 0, board: null })
        setLastFetchTime(Date.now())
        return
      }

      // Process the API response for calendar display
      const processedData = processCardsForCalendar(cardsWithDueDates)

      console.log('📅 Processed calendar data:', processedData)

      setCalendarData(processedData)
      setLastFetchTime(Date.now())
    } catch (err) {
      console.error('Error fetching calendar data:', err)
      setError('Có lỗi khi tải dữ liệu calendar. Vui lòng kiểm tra kết nối mạng và thử lại.')
      setCalendarData({ events: [], labels: [], users: [], totalCards: 0, board: null })

      // Show error notification
      setNotification({
        open: true,
        message: 'Không thể tải dữ liệu calendar. Vui lòng thử lại.',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Process API response into calendar format
  const processCardsForCalendar = (cardsData) => {
    try {
      if (!Array.isArray(cardsData)) {
        console.warn('Invalid cards data format:', cardsData)
        return { events: [], labels: [], users: [], totalCards: 0, board: null }
      }

      const events = cardsData.map(card => {
        const eventStyles = getEnhancedEventStyles(card.dueDate)
        const dueDateStatus = getDueDateStatus(card.dueDate)

        return {
          id: card._id,
          title: card.title,
          start: card.dueDate,
          end: card.dueDate,
          allDay: false,
          extendedProps: {
            cardId: card._id,
            columnTitle: card.columnTitle || 'Unknown Column',
            description: card.description || '',
            memberIds: card.memberIds || [],
            labelIds: card.labelIds || [],
            boardId: card.boardId,
            status: dueDateStatus,
            urgencyText: getUrgencyText(dueDateStatus),
            statusLevel: dueDateStatus
          },
          backgroundColor: eventStyles.backgroundColor,
          borderColor: eventStyles.borderColor,
          textColor: eventStyles.textColor,
          className: eventStyles.className,
          // Add visual priority indicators
          ...(dueDateStatus === DUE_DATE_STATUS.OVERDUE && {
            borderWidth: '3px',
            borderStyle: 'solid'
          })
        }
      })

      // Extract unique labels and users (simplified for now)
      const labels = []
      const users = []

      return {
        events,
        labels,
        users,
        totalCards: cardsData.length,
        board: null // We don't have full board data from this API
      }
    } catch (error) {
      console.error('Error processing cards for calendar:', error)
      return { events: [], labels: [], users: [], totalCards: 0, board: null }
    }
  }

  // Helper function to get enhanced event styling based on due date
  const getEnhancedEventStyles = (dueDate) => {
    const status = getDueDateStatus(dueDate)
    const styles = getCalendarEventStyles(status)

    return {
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor,
      textColor: styles.textColor,
      className: `fc-event ${styles.className}`,
      extendedProps: {
        urgencyText: getUrgencyText(status),
        statusLevel: status
      }
    }
  }

  // Load calendar data when component mounts or dependencies change
  useEffect(() => {
    fetchCalendarData()
  }, [isBoardCalendar, boardId])

  // Sync changes from ActiveCard modal to calendar
  useEffect(() => {
    if (currentActiveCard) {
      console.log('🔄 ActiveCard updated, syncing with calendar:', currentActiveCard)

      // If due date was updated, refresh calendar data
      if (currentActiveCard.dueDate !== undefined) {
        console.log('📅 Due date changed, refreshing calendar...')
        fetchCalendarData()
      }
    }
  }, [currentActiveCard?.dueDate, currentActiveCard?._id])

  // Handle modal close notification
  useEffect(() => {
    if (!isShowModalActiveCard && currentActiveCard) {
      setNotification({
        open: true,
        message: `📝 Đã đóng chi tiết card "${currentActiveCard.title}"`,
        severity: 'info'
      })
    }
  }, [isShowModalActiveCard, currentActiveCard])

  // Navigation handlers
  const handleBackToBoard = () => {
    if (boardId) {
      navigate(`/boards/${boardId}`)
    } else {
      navigate('/boards')
    }
  }

  const handleGoToBoards = () => {
    navigate('/boards')
  }

  // View options for switching
  const viewOptions = [
    { key: 'dayGridMonth', label: 'Tháng', icon: CalendarMonth },
    { key: 'timeGridWeek', label: 'Tuần', icon: CalendarViewWeek },
    { key: 'timeGridDay', label: 'Ngày', icon: CalendarToday }
  ]

  // Handle view change with FullCalendar API
  const handleViewChange = (view) => {
    console.log('🔄 Changing calendar view to:', view)
    setCurrentView(view)

    // Use FullCalendar API to change view
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      calendarApi.changeView(view)
    }
  }

  // Auto-refresh calendar when due dates change
  useEffect(() => {
    fetchCalendarData()
  }, [boardId]) // Refresh when boardId changes

  // Listen for active card changes to trigger calendar refresh
  useEffect(() => {
    // If modal just closed, refresh calendar to show latest changes
    if (!isShowModalActiveCard && lastFetchTime) {
      const shouldRefresh = shouldRefreshCalendar(lastFetchTime)
      if (shouldRefresh) {
        console.log('🔄 Refreshing calendar after modal close')
        fetchCalendarData()
      }
    }
  }, [isShowModalActiveCard, lastFetchTime, shouldRefreshCalendar])

  // Auto-refresh calendar every 30 seconds for live updates
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (!isShowModalActiveCard) { // Don't refresh while modal is open
        console.log('🔄 Auto-refreshing calendar')
        fetchCalendarData()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(refreshInterval)
  }, [isShowModalActiveCard])

  // Handle event click
  const handleEventClick = (clickInfo) => {
    const { extendedProps } = clickInfo.event

    console.log('📅 Event clicked:', {
      cardId: extendedProps.cardId,
      title: clickInfo.event.title,
      columnTitle: extendedProps.columnTitle,
      labelIds: extendedProps.labelIds,
      memberIds: extendedProps.memberIds
    })

    // Find the full card data from calendar events
    const fullCard = findCardById(extendedProps.cardId)

    if (fullCard) {
      // Dispatch action to show ActiveCard modal with card data
      dispatch(updateCurrentActiveCard(fullCard))
      dispatch(showModalActiveCard())
    } else {
      // Show error notification if card not found
      setNotification({
        open: true,
        message: '❌ Không tìm thấy thông tin card',
        severity: 'error'
      })
    }
  }

  // Helper function to find card by ID in calendar events
  const findCardById = (cardId) => {
    const event = events.find(evt => evt.extendedProps.cardId === cardId)
    if (!event) return null

    // Reconstruct card object from event data
    return {
      _id: cardId,
      title: event.title,
      dueDate: event.start,
      description: event.extendedProps.description || '',
      memberIds: event.extendedProps.memberIds || [],
      labelIds: event.extendedProps.labelIds || [],
      boardId: event.extendedProps.boardId,
      columnTitle: event.extendedProps.columnTitle
    }
  }

  // Handle event drop (drag & drop) with improved synchronization
  const handleEventDrop = async (dropInfo) => {
    const { event, oldEvent } = dropInfo
    const { extendedProps } = event

    // Validate if drop is allowed
    const targetDate = new Date(event.start)
    const oldDate = new Date(oldEvent.start)

    // Check if dropping to past date (before today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDateOnly = new Date(targetDate)
    targetDateOnly.setHours(0, 0, 0, 0)

    if (targetDateOnly < today) {
      // Revert the drop
      dropInfo.revert()
      setNotification({
        open: true,
        message: '❌ Không thể đặt deadline trong quá khứ',
        severity: 'error'
      })
      return
    }

    // Check if same date
    if (targetDate.getTime() === oldDate.getTime()) {
      console.log('📅 Same date, no update needed')
      return
    }

    try {
      // Preserve time component from original due date if it exists
      const originalDueDate = new Date(oldEvent.start)
      const newDueDate = new Date(targetDate)

      // If the original due date had a specific time, preserve it
      if (originalDueDate.getHours() !== 0 || originalDueDate.getMinutes() !== 0) {
        newDueDate.setHours(originalDueDate.getHours(), originalDueDate.getMinutes(), 0, 0)
      } else {
        // Default to 12:00 PM for all-day events moved to specific dates
        newDueDate.setHours(12, 0, 0, 0)
      }

      console.log('🎯 Event dropped:', {
        cardId: extendedProps.cardId,
        title: event.title,
        oldDate: oldEvent.start,
        newDate: newDueDate.toISOString(),
        columnTitle: extendedProps.columnTitle
      })

      // Use the synchronization hook for optimistic updates and error handling
      await updateDueDate(
        extendedProps.cardId,
        newDueDate.toISOString(),
        {
          optimistic: true,
          showToast: false, // We'll show our own notification
          source: 'calendar-drag-drop'
        }
      )

      // Emit socket event for real-time notifications following Universal Pattern
      socketIoInstance.emit('FE_CARD_DUE_DATE_UPDATED', {
        boardId: extendedProps.boardId || boardId,
        cardId: extendedProps.cardId,
        cardTitle: event.title || 'Thẻ không có tiêu đề',
        oldDueDate: oldEvent.start ? new Date(oldEvent.start).toISOString() : null,
        newDueDate: newDueDate.toISOString(),
        actionType: 'DRAG_DROP',
        userInfo: {
          _id: currentUser._id,
          displayName: currentUser.displayName || currentUser.username || 'Người dùng',
          username: currentUser.username,
          avatar: currentUser.avatar
        },
        timestamp: new Date().toISOString()
      })

      console.log('🗓️ Calendar: Emitted due date drag-drop event:', {
        action: 'DRAG_DROP',
        cardTitle: event.title,
        oldDate: oldEvent.start,
        newDate: newDueDate.toISOString(),
        actor: currentUser.displayName
      })

      // Update the event appearance immediately with enhanced styling
      const newEventStyles = getEnhancedEventStyles(newDueDate.toISOString())
      const newStatus = getDueDateStatus(newDueDate.toISOString())

      event.setProp('backgroundColor', newEventStyles.backgroundColor)
      event.setProp('borderColor', newEventStyles.borderColor)
      event.setProp('className', newEventStyles.className)
      event.setExtendedProp('status', newStatus)
      event.setExtendedProp('urgencyText', getUrgencyText(newStatus))
      event.setExtendedProp('statusLevel', newStatus)

      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }

      // Show success notification
      setNotification({
        open: true,
        message: `✅ Đã cập nhật deadline cho "${event.title}" sang ${formatDate(newDueDate)}`,
        severity: 'success'
      })

      console.log('✅ Due date updated successfully via calendar sync!')

      // Trigger calendar refresh after a short delay to ensure backend is updated
      setTimeout(() => {
        fetchCalendarData()
      }, 1000)

    } catch (error) {
      console.error('❌ Error updating due date via drag and drop:', error)

      // Revert the drop on error
      dropInfo.revert()

      setNotification({
        open: true,
        message: `❌ Có lỗi khi cập nhật deadline cho "${event.title}": ${error.message}`,
        severity: 'error'
      })
    }
  }

  // Handle date select (click on calendar)
  const handleDateSelect = (selectInfo) => {
    console.log('📅 Date selected:', {
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: selectInfo.allDay
    })

    // TODO: Show create new card dialog or other actions
    // For now, just log
  }

  // Handle event resize (if enabled)
  const handleEventResize = (resizeInfo) => {
    console.log('📏 Event resized:', {
      cardId: resizeInfo.event.extendedProps.cardId,
      oldEnd: resizeInfo.oldEvent.end,
      newEnd: resizeInfo.event.end
    })

    // Show notification
    setNotification({
      open: true,
      message: `⏰ Đã điều chỉnh thời gian cho "${resizeInfo.event.title}"`,
      severity: 'info'
    })
  }

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Đang tải lịch biểu...
        </Typography>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 2, height: '100vh' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Breadcrumb Navigation */}
      {isBoardCalendar && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBack />}
              onClick={handleBackToBoard}
              sx={{ minWidth: 'auto' }}
            >
              Về Board
            </Button>

            <Breadcrumbs separator="›" aria-label="breadcrumb">
              <Link
                to="/boards"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Home fontSize="small" />
                Boards
              </Link>
              <Link
                to={`/boards/${boardId}`}
                style={{
                  textDecoration: 'none',
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Dashboard fontSize="small" />
                {boardTitle}
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarMonth fontSize="small" />
                Lịch biểu
              </Typography>
            </Breadcrumbs>
          </Stack>
        </Box>
      )}

      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          📅 {isBoardCalendar ? `Lịch biểu - ${boardTitle}` : 'Lịch biểu dự án'}
        </Typography>


        {/* Labels Legend */}
        {labels.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              🏷️ Labels:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {labels.map((label) => (
                <Chip
                  key={label._id}
                  label={label.title}
                  size="small"
                  sx={{
                    backgroundColor: label.color,
                    color: '#ffffff',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: label.color,
                      opacity: 0.8
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* View Switcher and Refresh Button */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1}>
            {viewOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <Chip
                  key={option.key}
                  icon={<IconComponent />}
                  label={option.label}
                  onClick={() => handleViewChange(option.key)}
                  color={currentView === option.key ? 'primary' : 'default'}
                  variant={currentView === option.key ? 'filled' : 'outlined'}
                  sx={{ fontWeight: currentView === option.key ? 600 : 400 }}
                />
              )
            })}
          </Stack>

          {/* Manual Refresh Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={() => fetchCalendarData()}
            disabled={loading}
            sx={{ minWidth: 'auto' }}
          >
            Làm mới
          </Button>
        </Stack>
      </Box>


      {/* Calendar Container */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          p: 2,
          overflow: 'hidden',
          '& .fc': {
            height: '100%'
          }
        }}
      >
        {loading ? (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            flexDirection: 'column'
          }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Đang tải dữ liệu calendar...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" color="error.main" gutterBottom>
              ❌ Có lỗi khi tải calendar
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchCalendarData}
              sx={{ mt: 2 }}
            >
              Thử lại
            </Button>
          </Box>
        ) : !Array.isArray(events) || events.length === 0 ? (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              📅 Chưa có task nào có deadline
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thêm deadline cho các task để hiển thị trên calendar
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: '100%', position: 'relative' }}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={currentView}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              events={events.filter(event => event && event.id && event.title && event.start)}
              editable={true}
              droppable={true}
              selectable={true}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              height="100%"
              
              // Enhanced Vietnamese localization
              locale={vietnameseLocaleConfig}
              
              // Enhanced date/time formatting
              titleFormat={{
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }}
              dayHeaderFormat={{
                weekday: 'short',
                day: '2-digit',
                month: '2-digit'
              }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              
              // Enhanced display options
              eventDisplay="block"
              eventTextColor="#fff"
              displayEventTime={true}
              displayEventEnd={false}
              
              // Enhanced responsive configurations
              aspectRatio={isMobile ? 1.0 : isTablet ? 1.35 : 1.8}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              slotDuration="01:00:00"
              slotLabelInterval="01:00:00"
              allDaySlot={true}
              nowIndicator={true}
              weekends={true}
              
              // Enhanced styling and interaction
              eventClassNames="calendar-event"
              dayMaxEventRows={isMobile ? 2 : 4}
              moreLinkText="thêm tasks"
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
                startTime: '08:00',
                endTime: '18:00'
              }}
              
              eventMouseEnter={(info) => {
                try {
                  info.el.style.cursor = 'pointer'
                  info.el.title = `${info.event.title} - ${info.event.extendedProps?.columnTitle || 'Unknown Column'}`
                } catch (error) {
                  console.warn('Error setting event hover:', error)
                }
              }}
              // Event rendering
              eventDidMount={(info) => {
                try {
                  // Add tooltip with more details
                  const { extendedProps } = info.event
                  const labelText = extendedProps?.labelIds && extendedProps.labelIds.length > 0
                    ? `Labels: ${extendedProps.labelIds.length} label(s)`
                    : 'Labels: None'
                  const memberText = extendedProps?.memberIds && extendedProps.memberIds.length > 0
                    ? `Members: ${extendedProps.memberIds.length} member(s)`
                    : 'Members: Chưa assign'

                  info.el.title = `${info.event.title}\nColumn: ${extendedProps?.columnTitle || 'Unknown'}\n${labelText}\n${memberText}`
                } catch (error) {
                  console.warn('Error setting event tooltip:', error)
                  info.el.title = info.event.title
                }
              }}
              dateClick={handleDateSelect}
            />
          </Box>
        )}
      </Paper>

      {/* Enhanced Custom CSS for FullCalendar */}
      <style jsx global>{`
        .fc-theme-standard .fc-scrollgrid {
          border: none;
        }
        
        /* Enhanced header styling for better date visibility */
        .fc-col-header {
          background-color: ${theme.palette.grey[50]};
          border-bottom: 2px solid ${theme.palette.divider};
        }
        
        .fc-col-header-cell {
          padding: 8px 4px;
          font-weight: 600;
          font-size: 0.9rem;
          color: ${theme.palette.text.primary};
        }
        
        .fc-daygrid-day-number {
          font-size: 1.1rem !important;
          font-weight: 600 !important;
          color: ${theme.palette.text.primary} !important;
          padding: 4px 6px !important;
        }
        
        .fc-daygrid-day:hover {
          background-color: ${theme.palette.action.hover};
        }
        
        .fc-daygrid-day.fc-day-today {
          background-color: ${theme.palette.primary.main}10 !important;
        }
        
        .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background-color: ${theme.palette.primary.main} !important;
          color: white !important;
          border-radius: 6px !important;
          font-weight: 700 !important;
        }
        
        /* Enhanced title formatting */
        .fc-toolbar-title {
          font-size: 1.8rem !important;
          font-weight: 700 !important;
          color: ${theme.palette.text.primary} !important;
          letter-spacing: 0.5px !important;
        }
        
        /* Enhanced time slot styling */
        .fc-timegrid-slot-label {
          font-size: 0.85rem !important;
          font-weight: 600 !important;
          color: ${theme.palette.text.secondary} !important;
          padding-right: 8px !important;
        }
        
        .fc-timegrid-axis {
          border-right: 2px solid ${theme.palette.divider} !important;
        }
        
        /* Drag & Drop Visual Feedback */
        .fc-event-dragging {
          opacity: 0.7;
          transform: scale(1.05);
          z-index: 999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }
        
        .fc-event-resizing {
          opacity: 0.8;
        }
        
        .fc-highlight {
          background-color: ${theme.palette.primary.main}20 !important;
          border-radius: 4px;
        }
        
        .fc-day.fc-day-past {
          background-color: ${theme.palette.action.disabledBackground}20;
          color: ${theme.palette.text.disabled};
        }
        
        .fc-timegrid-slot:hover {
          background-color: ${theme.palette.action.hover}50;
        }
        
        .calendar-event {
          border-radius: 6px !important;
          font-weight: 500;
          font-size: 0.875rem;
          padding: 2px 6px;
          margin: 1px 0;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .calendar-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .calendar-event.fc-event-mirror {
          opacity: 0.8;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;
        }
        
        .fc-event-title {
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .fc-event-time {
          font-weight: 500;
          font-size: 0.75rem;
        }
        
        /* Enhanced button styling */
        .fc-button {
          background-color: ${theme.palette.primary.main} !important;
          border-color: ${theme.palette.primary.main} !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          padding: 6px 12px !important;
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
        }
        
        .fc-button:hover {
          background-color: ${theme.palette.primary.dark} !important;
          border-color: ${theme.palette.primary.dark} !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        
        .fc-button:disabled {
          opacity: 0.6 !important;
        }
        
        .fc-button:focus {
          outline: 2px solid ${theme.palette.primary.main}40 !important;
          outline-offset: 2px !important;
        }
        
        /* Enhanced week view styling */
        .fc-timegrid-col {
          border-right: 1px solid ${theme.palette.divider} !important;
        }
        
        .fc-timegrid-divider {
          background-color: ${theme.palette.divider} !important;
          height: 2px !important;
        }
        
        /* Better slot highlighting */
        .fc-timegrid-slot:hover {
          background-color: ${theme.palette.action.hover}30 !important;
        }
        
        .fc-timegrid-slot.fc-timegrid-slot-minor {
          border-top: 1px dotted ${theme.palette.divider}60 !important;
        }
        
        .fc-today {
          background-color: ${theme.palette.primary.main}08 !important;
        }
        
        .fc-daygrid-event {
          margin: 1px 2px !important;
        }
        
        .fc-timegrid-event {
          margin: 0 1px !important;
        }
        
        /* Enhanced mobile responsive design */
        @media (max-width: ${theme.breakpoints.values.md}px) {
          .fc-toolbar {
            flex-direction: column;
            gap: 12px;
            padding: 8px 0;
          }
          
          .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }
          
          .fc-toolbar-title {
            font-size: 1.4rem !important;
            text-align: center;
            margin-bottom: 8px;
          }
          
          .fc-button {
            font-size: 0.8rem !important;
            padding: 4px 8px !important;
            margin: 0 2px !important;
          }
          
          .fc-daygrid-day-number {
            font-size: 1rem !important;
            padding: 2px 4px !important;
          }
          
          .fc-col-header-cell {
            font-size: 0.8rem !important;
            padding: 6px 2px !important;
          }
          
          .fc-timegrid-slot-label {
            font-size: 0.75rem !important;
            padding-right: 4px !important;
          }
          
          .calendar-event {
            font-size: 0.75rem;
            padding: 1px 4px;
            line-height: 1.2;
          }
          
          .fc-event-title {
            font-size: 0.7rem !important;
            line-height: 1.1 !important;
          }
          
          .fc-event-time {
            font-size: 0.65rem !important;
            font-weight: 600 !important;
          }
        }
        
        /* Enhanced tablet responsive design */
        @media (max-width: ${theme.breakpoints.values.lg}px) and (min-width: ${theme.breakpoints.values.md + 1}px) {
          .fc-toolbar-title {
            font-size: 1.6rem !important;
          }
          
          .fc-daygrid-day-number {
            font-size: 1.05rem !important;
          }
          
          .fc-col-header-cell {
            font-size: 0.85rem !important;
          }
          
          .calendar-event {
            font-size: 0.8rem;
          }
        }
      `}</style>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* ActiveCard Modal */}
      <ActiveCard />
    </Box>
  )
}

export default Calendar