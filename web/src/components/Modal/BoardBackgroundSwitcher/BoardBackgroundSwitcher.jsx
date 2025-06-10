/**
 * BoardBackgroundSwitcher Component
 * 
 * Cho phép người dùng thay đổi hình nền cho board với các tùy chọn:
 * - Chọn màu từ danh sách preset
 * - Chọn hình ảnh từ danh sách preset
 * - Nhập URL hình ảnh tùy chỉnh
 * - Tải lên file hình ảnh từ máy tính
 * 
 * Features:
 * - Live preview: Hiển thị background ngay trên board khi chọn
 * - Responsive UI: Hiển thị tối ưu trên mobile và desktop
 * - Error handling: Xử lý các lỗi mạng và server
 * - Loading states: Hiển thị trạng thái loading khi lưu
 * - Accessibility: Hỗ trợ keyboard navigation và ARIA
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import CancelIcon from '@mui/icons-material/Cancel'
import ColorLensIcon from '@mui/icons-material/ColorLens'
import ImageIcon from '@mui/icons-material/Image'
import LinkIcon from '@mui/icons-material/Link'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CircularProgress from '@mui/material/CircularProgress'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Snackbar from '@mui/material/Snackbar'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import LinearProgress from '@mui/material/LinearProgress'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'

import BackgroundColorPicker from './BackgroundColorPicker'
import BackgroundImagePicker from './BackgroundImagePicker'
import CustomUrlInput from './CustomUrlInput'
import FileUploadSection from './FileUploadSection'

import { 
  selectBoardBackground, 
  updateBoardBackground,
  fetchBoardDetailsAPI
} from '~/redux/activeBoard/activeBoardSlice'
import { updateBoardBackgroundAPI } from '~/apis'
import { 
  BACKGROUND_TYPES, 
  formatBackgroundData,
  DEFAULT_BACKGROUND 
} from '~/utils/backgroundConstants'

// Tab values cho navigation
const TAB_VALUES = {
  COLORS: 0,
  IMAGES: 1,
  CUSTOM_URL: 2,
  FILE_UPLOAD: 3
}

// Error states enum
const ERROR_STATES = {
  NONE: 'none',
  NETWORK: 'network',
  SERVER: 'server',
  TIMEOUT: 'timeout',
  DATA: 'data',
  UNKNOWN: 'unknown'
};

/**
 * BoardBackgroundSwitcher - Component chính để thay đổi background của board
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Trạng thái hiển thị của modal
 * @param {function} props.onClose - Callback khi đóng modal
 * @param {string} props.boardId - ID của board cần thay đổi background
 */
function BoardBackgroundSwitcher({ isOpen, onClose, boardId }) {
  const theme = useTheme()
  const dispatch = useDispatch()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  // Get current background từ Redux store
  const currentBackground = useSelector(selectBoardBackground)
  
  // Local state management
  const [activeTab, setActiveTab] = useState(TAB_VALUES.COLORS)
  const [selectedBackground, setSelectedBackground] = useState(currentBackground)
  const [originalBackground, setOriginalBackground] = useState(currentBackground)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [errorState, setErrorState] = useState(ERROR_STATES.NONE)
  const [errorMessage, setErrorMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastSeverity, setToastSeverity] = useState('info')
  
  // Refs for retrying
  const retryCount = useRef(0)
  const progressTimerRef = useRef(null)

  // Reset state khi modal mở
  useEffect(() => {
    if (isOpen) {
      setSelectedBackground(currentBackground)
      setOriginalBackground(currentBackground)
      setActiveTab(TAB_VALUES.COLORS)
      setIsLoading(false)
      setIsSaving(false)
      setErrorState(ERROR_STATES.NONE)
      setErrorMessage('')
      retryCount.current = 0
    }
  }, [isOpen, currentBackground])

  // Cleanup effects on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // Live preview - cập nhật background real-time
  useEffect(() => {
    if (isOpen && selectedBackground) {
      // Chỉ cập nhật live preview nếu không đang trong quá trình lưu
      if (!isSaving) {
        dispatch(updateBoardBackground(selectedBackground))
      }
    }
  }, [selectedBackground, isOpen, dispatch, isSaving])

  /**
   * Handle tab change
   * Disabled khi đang loading
   */
  const handleTabChange = useCallback((event, newValue) => {
    // Nếu đang loading, không cho phép đổi tab
    if (isLoading) return;
    
    setActiveTab(newValue)
  }, [isLoading])

  /**
   * Handle background selection từ các components con
   * @param {string} type - Loại background (COLOR, IMAGE)
   * @param {string} value - Giá trị background (hex color hoặc image URL)
   */
  const handleBackgroundSelect = useCallback((type, value) => {
    // Nếu đang loading, không cho phép thay đổi background
    if (isLoading) return;
    
    const backgroundData = formatBackgroundData(type, value)
    setSelectedBackground(backgroundData)
  }, [isLoading])

  /**
   * Handle keyboard navigation
   * Support ESC để đóng modal
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleCancel()
    }
  }, [])

  /**
   * Simulate progress bar cho loading experience
   * Tăng dần từ 0-90%, API response sẽ hoàn thành nốt 10% còn lại
   */
  const startProgressSimulation = useCallback(() => {
    // Reset progress
    setLoadingProgress(0);
    
    // Clear any existing timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    
    // Start progress simulation
    progressTimerRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        // Slowly increase up to 90%, then API response will complete it
        const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 85 ? 1 : 0.5;
        const next = Math.min(prev + increment, 90);
        return next;
      });
    }, 200);
  }, []);

  /**
   * Stop progress simulation
   * @param {boolean} success - Whether operation was successful
   */
  const stopProgressSimulation = useCallback((success = true) => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    
    // Complete the progress bar
    setLoadingProgress(success ? 100 : 0);
    
    // Reset progress after animation completes
    if (success) {
      setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
    }
  }, []);

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} severity - Severity level (info, success, warning, error)
   */
  const showNotification = useCallback((message, severity = 'info') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setShowToast(true);
  }, []);

  /**
   * Handle closing toast
   */
  const handleCloseToast = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowToast(false);
  }, []);

  /**
   * Map error code to error state
   * @param {string} code - Error code from API
   * @returns {string} Error state
   */
  const mapErrorCodeToState = useCallback((code) => {
    switch (code) {
      case 'NETWORK_ERROR':
        return ERROR_STATES.NETWORK;
      case 'SERVER_ERROR':
        return ERROR_STATES.SERVER;
      case 'TIMEOUT':
        return ERROR_STATES.TIMEOUT;
      case 'DATA_ERROR':
        return ERROR_STATES.DATA;
      default:
        return ERROR_STATES.UNKNOWN;
    }
  }, []);

  /**
   * Handle cancel - restore original background
   * Reset error state and restore original background
   */
  const handleCancel = useCallback(() => {
    // Nếu đang có lỗi, xóa lỗi khi cancel
    if (errorState !== ERROR_STATES.NONE) {
      setErrorState(ERROR_STATES.NONE);
      setErrorMessage('');
    }
    
    // Đặt cờ để ngăn useEffect cập nhật background khi đang lưu
    setIsSaving(true)
    
    // Restore original background
    dispatch(updateBoardBackground(originalBackground))
    
    // Đóng modal sau khi cập nhật xong
    setTimeout(() => {
      onClose()
      setIsSaving(false)
    }, 100) // Timeout nhỏ để đảm bảo animation mượt mà
  }, [originalBackground, dispatch, onClose, errorState])

  /**
   * Handle retry save after error
   * Increment retry count and try again
   */
  const handleRetry = useCallback(() => {
    // Increment retry count
    retryCount.current += 1;
    
    // Reset error state
    setErrorState(ERROR_STATES.NONE);
    setErrorMessage('');
    
    // Try save again
    handleSave();
  }, []);

  // Thêm hàm chuyển đổi background FE sang payload backend
  function mapBackgroundToApiPayload(selectedBackground) {
    if (!selectedBackground) return {}
    const { type, value } = selectedBackground
    if (type === 'color') return { backgroundType: 'color', backgroundColor: value }
    if (type === 'image' && typeof value === 'string' && value.startsWith('http')) return { backgroundType: 'image', backgroundImage: value }
    if (type === 'url') return { backgroundType: 'url', backgroundUrl: value }
    if (type === 'upload' && value instanceof File) return { backgroundType: 'upload', backgroundUpload: value }
    return {}
  }

  /**
   * Handle save - gọi API và toast notification
   * Xử lý các trạng thái loading và error
   */
  const handleSave = useCallback(async () => {
    console.log('selectedBackground khi lưu:', selectedBackground)
    if (!selectedBackground || !boardId) return

    setIsSaving(true)
    setIsLoading(true)
    setErrorState(ERROR_STATES.NONE)
    setErrorMessage('')
    startProgressSimulation();
    try {
      if (retryCount.current > 0) {
        showNotification(`Đang thử lại (lần ${retryCount.current})...`, 'info');
      }
      const apiPayload = mapBackgroundToApiPayload(selectedBackground)
      const response = await updateBoardBackgroundAPI(boardId, apiPayload)
      if (response.success) {
        stopProgressSimulation(true);
        // Fetch lại board từ backend để đồng bộ dữ liệu
        await dispatch(fetchBoardDetailsAPI(boardId))
        toast.success('Background đã được cập nhật thành công!', {
          position: 'bottom-right',
          autoClose: 3000,
          theme: 'colored'
        })
        onClose()
      }
    } catch (error) {
      stopProgressSimulation(false);
      console.error('Error updating background:', error);
      const errorStateValue = mapErrorCodeToState(error.code);
      setErrorState(errorStateValue);
      setErrorMessage(error.message || 'Có lỗi xảy ra khi cập nhật background');
      dispatch(updateBoardBackground(originalBackground))
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật background!', {
        position: 'bottom-right',
        autoClose: 3000,
        theme: 'colored'
      })
    } finally {
      setIsLoading(false)
      setIsSaving(false)
    }
  }, [selectedBackground, boardId, originalBackground, dispatch, onClose, startProgressSimulation, stopProgressSimulation, showNotification, mapBackgroundToApiPayload, mapErrorCodeToState])

  /**
   * Kiểm tra nếu background hiện tại khác với background gốc
   * @returns {boolean} true if changes exist
   */
  const hasChanges = useCallback(() => {
    if (!selectedBackground || !originalBackground) return false
    
    return (
      selectedBackground.type !== originalBackground.type || 
      selectedBackground.value !== originalBackground.value
    )
  }, [selectedBackground, originalBackground])

  /**
   * Render error message based on error state
   * @returns {JSX.Element|null} Error message component
   */
  const renderErrorMessage = () => {
    if (errorState === ERROR_STATES.NONE) return null;
    
    const getErrorTitle = () => {
      switch (errorState) {
        case ERROR_STATES.NETWORK:
          return 'Lỗi kết nối mạng';
        case ERROR_STATES.SERVER:
          return 'Lỗi máy chủ';
        case ERROR_STATES.TIMEOUT:
          return 'Hết thời gian chờ';
        case ERROR_STATES.DATA:
          return 'Lỗi dữ liệu';
        default:
          return 'Đã xảy ra lỗi';
      }
    };

    const getErrorAction = () => {
      switch (errorState) {
        case ERROR_STATES.NETWORK:
        case ERROR_STATES.SERVER:
        case ERROR_STATES.TIMEOUT:
          return (
            <Button 
              color="error" 
              size="small" 
              variant="outlined" 
              onClick={handleRetry}
              sx={{ mt: 1 }}
            >
              Thử lại
            </Button>
          );
        default:
          return null;
      }
    };
    
    return (
      <Alert 
        severity="error" 
        variant="filled"
        sx={{ 
          mb: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={() => {
              setErrorState(ERROR_STATES.NONE);
              setErrorMessage('');
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle>{getErrorTitle()}</AlertTitle>
        {errorMessage}
        {getErrorAction()}
      </Alert>
    );
  };

  /**
   * Render tab content based on activeTab
   * @returns {JSX.Element} Tab content component
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case TAB_VALUES.COLORS:
        return (
          <BackgroundColorPicker 
            selectedBackground={selectedBackground}
            onSelectColor={(color) => handleBackgroundSelect(BACKGROUND_TYPES.COLOR, color)}
          />
        )
      case TAB_VALUES.IMAGES:
        return (
          <BackgroundImagePicker 
            selectedBackground={selectedBackground}
            onSelectImage={(imageUrl) => handleBackgroundSelect(BACKGROUND_TYPES.IMAGE, imageUrl)}
          />
        )
      case TAB_VALUES.CUSTOM_URL:
        return (
          <CustomUrlInput 
            selectedBackground={selectedBackground}
            onApplyUrl={(type, value) => handleBackgroundSelect(type, value)}
          />
        )
      case TAB_VALUES.FILE_UPLOAD:
        return (
          <FileUploadSection 
            selectedBackground={selectedBackground}
            onFileSelect={(type, value) => {
              console.log('onFileSelect:', type, value)
              handleBackgroundSelect(type, value)
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleCancel}
        aria-labelledby="board-background-switcher-modal"
        aria-describedby="modal to change board background"
        onKeyDown={handleKeyDown}
        closeAfterTransition
        disableScrollLock={false}
        slots={{
          backdrop: Backdrop
        }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(0, 0, 0, 0.8)' 
                : 'rgba(0, 0, 0, 0.6)'
            }
          }
        }}
      >
        <Fade in={isOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '95%' : 480,
            maxWidth: '480px',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            outline: 'none',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          >
            {/* Progress Bar */}
            {isLoading && (
              <LinearProgress 
                variant="determinate" 
                value={loadingProgress} 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  zIndex: 10
                }}
              />
            )}
            
            {/* Header */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: isMobile ? 2 : 3,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="h6" component="h2">
                Thay đổi hình nền Board
              </Typography>
              
              <CancelIcon 
                color="error" 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { color: 'error.light' } 
                }} 
                onClick={handleCancel}
                aria-label="Đóng dialog" 
              />
            </Box>

            {/* Tabs Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant={isMobile ? 'scrollable' : 'fullWidth'}
                scrollButtons={isMobile ? 'auto' : false}
                aria-label="Background options tabs"
              >
                <Tab 
                  icon={<ColorLensIcon />} 
                  label={isMobile ? '' : 'Màu sắc'} 
                  value={TAB_VALUES.COLORS}
                  aria-label="Chọn màu background"
                  disabled={isLoading}
                />
                <Tab 
                  icon={<ImageIcon />} 
                  label={isMobile ? '' : 'Hình ảnh'} 
                  value={TAB_VALUES.IMAGES}
                  aria-label="Chọn hình ảnh background"
                  disabled={isLoading}
                />
                <Tab 
                  icon={<LinkIcon />} 
                  label={isMobile ? '' : 'URL'} 
                  value={TAB_VALUES.CUSTOM_URL}
                  aria-label="Nhập URL hình ảnh"
                  disabled={isLoading}
                />
                <Tab 
                  icon={<CloudUploadIcon />} 
                  label={isMobile ? '' : 'Tải lên'} 
                  value={TAB_VALUES.FILE_UPLOAD}
                  aria-label="Tải lên file hình ảnh"
                  disabled={isLoading}
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{
              flex: 1,
              overflow: 'auto',
              p: isMobile ? 2 : 3,
              position: 'relative'
            }}>
              {/* Error Messages */}
              {renderErrorMessage()}
              
              {/* Loading Overlay */}
              {isLoading && (
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 9
                  }}
                >
                  <CircularProgress size={60} />
                  <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                    {loadingProgress < 30 
                      ? 'Đang kết nối...' 
                      : loadingProgress < 70 
                        ? 'Đang xử lý...'
                        : 'Sắp hoàn thành...'}
                  </Typography>
                  <Box sx={{ 
                    width: '60%', 
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      {`${Math.round(loadingProgress)}%`}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {renderTabContent()}
            </Box>

            {/* Footer Actions */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              p: isMobile ? 2 : 3,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Button 
                variant="outlined" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
              
              <Button 
                variant="contained" 
                onClick={handleSave}
                // disabled={isLoading || !hasChanges()}
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {isLoading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Toast notifications */}
      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toastSeverity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default BoardBackgroundSwitcher 