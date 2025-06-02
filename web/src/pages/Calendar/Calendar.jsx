import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Paper, Chip, Stack, useTheme, useMediaQuery, CircularProgress, Alert, Snackbar, Breadcrumbs, Button } from '@mui/material'
import { CalendarMonth, CalendarViewWeek, CalendarToday, ArrowBack, Home, Dashboard } from '@mui/icons-material'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'

// Import mock data and helpers
import { mockData } from '~/apis/mock-data'
import { processCalendarData } from '~/utils/calendarHelpers'

// Import ActiveCard modal components
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import { 
  updateCurrentActiveCard, 
  showModalActiveCard,
  selectCurrentActiveCard,
  selectIsShowModalActiveCard
} from '~/redux/activeCard/activeCardSlice'

// Import board selector if needed
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'

function Calendar() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { boardId } = useParams()
  
  // Redux selectors for ActiveCard modal and board data
  const currentActiveCard = useSelector(selectCurrentActiveCard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const currentActiveBoard = useSelector(selectCurrentActiveBoard)
  
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

  // Process calendar data từ mock data
  const calendarData = useMemo(() => {
    try {
      // If board-specific calendar, filter data for that board
      let sourceData = mockData
      if (isBoardCalendar && boardId) {
        // For now use mock data, later this would filter by actual boardId
        sourceData = mockData
      }
      return processCalendarData(sourceData)
    } catch (err) {
      setError('Có lỗi khi xử lý dữ liệu calendar')
      return { events: [], labels: [], users: [], totalCards: 0, board: null }
    }
  }, [isBoardCalendar, boardId])

  const { events, labels, users, totalCards, board } = calendarData

  // Simulate loading for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    
    return () => clearTimeout(timer)
  }, [])

  // Sync changes from ActiveCard modal to calendar
  useEffect(() => {
    if (currentActiveCard) {
      console.log('🔄 ActiveCard updated, syncing with calendar:', currentActiveCard)
      
      // Re-process calendar data when card is updated
      // This will refresh the events with updated card data
      // For now, we log it - in real app, we'd update the events state
    }
  }, [currentActiveCard])

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

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  // Handle event click
  const handleEventClick = (clickInfo) => {
    const { extendedProps } = clickInfo.event
    
    console.log('📅 Event clicked:', {
      cardId: extendedProps.cardId,
      title: clickInfo.event.title,
      columnTitle: extendedProps.columnTitle,
      labels: extendedProps.labels,
      memberNames: extendedProps.memberNames
    })
    
    // Find the full card data from board
    const fullCard = findCardById(extendedProps.cardId, board)
    
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

  // Helper function to find card by ID in board data
  const findCardById = (cardId, boardData) => {
    if (!boardData || !boardData.columns) return null
    
    for (const column of boardData.columns) {
      if (column.cards) {
        const card = column.cards.find(c => c._id === cardId)
        if (card) {
          return card
        }
      }
    }
    return null
  }

  // Handle event drop (drag & drop)
  const handleEventDrop = (dropInfo) => {
    const { event, oldEvent } = dropInfo
    const { extendedProps } = event
    
    // Validate if drop is allowed
    const targetDate = new Date(event.start)
    const oldDate = new Date(oldEvent.start)
    
    // Check if dropping to past date (before today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    targetDate.setHours(0, 0, 0, 0)
    
    if (targetDate < today) {
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
      // Same date, no need to update
      return
    }
    
    console.log('🎯 Event dropped:', {
      cardId: extendedProps.cardId,
      title: event.title,
      oldDate: oldEvent.start,
      newDate: event.start,
      columnTitle: extendedProps.columnTitle
    })
    
    // TODO: Update card dueDate in state/backend
    // For now, just show success message with date info
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    console.log('✅ Due date updated successfully!')
    
    // Show success notification with details
    setNotification({
      open: true,
      message: `✅ Đã cập nhật deadline cho "${event.title}" sang ${formatDate(event.start)}`,
      severity: 'success'
    })
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
        
        {/* Summary Stats */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isBoardCalendar && (
            <>Board: <strong>{boardTitle}</strong> • </>
          )}
          Tổng cộng <strong>{totalCards}</strong> tasks có deadline • 
          <strong>{labels.length}</strong> labels • 
          <strong>{users.length}</strong> thành viên
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
        
        {/* View Switcher */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
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
        {events.length === 0 ? (
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
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            view={currentView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: ''
            }}
            events={events}
            editable={true}
            droppable={true}
            selectable={true}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="100%"
            locale="vi"
            buttonText={{
              today: 'Hôm nay',
              month: 'Tháng',
              week: 'Tuần',
              day: 'Ngày'
            }}
            dayHeaderFormat={{ 
              weekday: 'short',
              month: 'numeric',
              day: 'numeric'
            }}
            eventDisplay="block"
            eventTextColor="#fff"
            eventMouseEnter={(info) => {
              info.el.style.cursor = 'pointer'
              info.el.title = `${info.event.title} - ${info.event.extendedProps.columnTitle}`
            }}
            // Responsive configurations
            aspectRatio={isMobile ? 1.0 : isTablet ? 1.35 : 1.8}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={true}
            nowIndicator={true}
            weekends={true}
            // Custom styling
            eventClassNames="calendar-event"
            dayMaxEventRows={isMobile ? 2 : 4}
            moreLinkText="tasks khác"
            // Event rendering
            eventDidMount={(info) => {
              // Add tooltip with more details
              const { extendedProps } = info.event
              info.el.title = `${info.event.title}\nColumn: ${extendedProps.columnTitle}\nLabels: ${extendedProps.labels.join(', ')}\nMembers: ${extendedProps.memberNames || 'Chưa assign'}`
            }}
            dateClick={handleDateSelect}
          />
        )}
      </Paper>

      {/* Custom CSS for FullCalendar */}
      <style jsx global>{`
        .fc-theme-standard .fc-scrollgrid {
          border: none;
        }
        
        .fc-col-header {
          background-color: ${theme.palette.grey[50]};
        }
        
        .fc-daygrid-day:hover {
          background-color: ${theme.palette.action.hover};
        }
        
        .fc-daygrid-day.fc-day-today {
          background-color: ${theme.palette.primary.main}10 !important;
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
        
        .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          color: ${theme.palette.text.primary};
        }
        
        .fc-button {
          background-color: ${theme.palette.primary.main} !important;
          border-color: ${theme.palette.primary.main} !important;
          font-weight: 500 !important;
        }
        
        .fc-button:hover {
          background-color: ${theme.palette.primary.dark} !important;
          border-color: ${theme.palette.primary.dark} !important;
        }
        
        .fc-button:disabled {
          opacity: 0.6 !important;
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
        
        @media (max-width: ${theme.breakpoints.values.md}px) {
          .fc-toolbar {
            flex-direction: column;
            gap: 10px;
          }
          
          .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }
          
          .calendar-event {
            font-size: 0.75rem;
            padding: 1px 4px;
          }
          
          .fc-event-title {
            font-size: 0.75rem;
          }
          
          .fc-event-time {
            font-size: 0.7rem;
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