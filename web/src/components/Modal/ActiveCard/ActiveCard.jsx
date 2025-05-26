import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CancelIcon from '@mui/icons-material/Cancel'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'

import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'

import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { singleFileValidator } from '~/utils/validators'
import { toast } from 'react-toastify'
import CardUserGroup from './CardUserGroup'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardActivitySection from './CardActivitySection'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  selectIsShowModalActiveCard
} from '~/redux/activeCard/activeCardSlice'
import { updateCardDetailsAPI } from '~/apis'
import { updateCardInBoard } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { styled } from '@mui/material/styles'
const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
  backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
  padding: '10px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300],
    '&.active': {
      color: theme.palette.mode === 'dark' ? '#000000de' : '#0c66e4',
      backgroundColor: theme.palette.mode === 'dark' ? '#90caf9' : '#e9f2ff'
    }
  }
}))

/**
 * Note: Modal là một low-component mà bọn MUI sử dụng bên trong những thứ như Dialog, Drawer, Menu, Popover. Ở đây dĩ nhiên chúng ta có thể sử dụng Dialog cũng không thành vấn đề gì, nhưng sẽ sử dụng Modal để dễ linh hoạt tùy biến giao diện từ con số 0 cho phù hợp với mọi nhu cầu nhé.
 */
function ActiveCard() {
  const dispatch = useDispatch()
  const activeCard = useSelector(selectCurrentActiveCard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const currentUser = useSelector(selectCurrentUser)

  // State for "Thêm" button dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const openMoreMenu = Boolean(anchorEl);
  const handleMoreMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMoreMenuClose = () => {
    setAnchorEl(null);
  };

  // Không dùng biến State để check đóng mở Modal nữa vì chúng ta sẽ check theo cái biến isShowModalActiveCard trong redux
  // const [isOpen, setIsOpen] = useState(true)
  // const handleOpenModal = () => setIsOpen(true)
  const handleCloseModal = () => {
    // setIsOpen(false)
    dispatch(clearAndHideCurrentActiveCard())
  }

  // Func gọi API dùng chung cho các trường hợp update card title, description, cover, comment...vv
  const callApiUpdateCard = async (updateData) => {
    const updatedCard = await updateCardDetailsAPI(activeCard._id, updateData)

    // B1: Cập nhật lại cái card đang active trong modal hiện tại
    dispatch(updateCurrentActiveCard(updatedCard))

    // B2: Cập nhật lại cái bản ghi card trong cái activeBoard (nested data)
    dispatch(updateCardInBoard(updatedCard))

    return updatedCard
  }

  const onUpdateCardTitle = (newTitle) => {
    callApiUpdateCard({ title: newTitle.trim() })
  }

  const onUpdateCardDescription = (newDescription) => {
    callApiUpdateCard({ description: newDescription })
  }

  const onUploadCardCover = (event) => {
    // console.log(event.target?.files[0])
    const error = singleFileValidator(event.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }
    let reqData = new FormData()
    reqData.append('cardCover', event.target?.files[0])

    // Gọi API...
    toast.promise(
      callApiUpdateCard(reqData).finally(() => event.target.value = ''),
      { pending: 'Updating...' }
    )
  }

  // Dùng async await ở đây để component con CardActivitySection chờ và nếu thành công thì mới clear thẻ input comment
  const onAddCardComment = async (commentToAdd) => {
    await callApiUpdateCard({ commentToAdd })
  }

  const onUpdateCardMembers = (incomingMemberInfo) => {
    callApiUpdateCard({ incomingMemberInfo })
  }

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal} // Sử dụng onClose trong trường hợp muốn đóng Modal bằng nút ESC hoặc click ra ngoài Modal
      sx={{ overflowY: 'auto' }}>
      <Box sx={{
        position: 'relative',
        width: 1100,
        maxWidth: 1100,
        bgcolor: 'white',
        boxShadow: 24,
        borderRadius: '8px',
        border: 'none',
        outline: 0,
        padding: '40px 32px 32px',
        margin: '48px auto',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1A2027' : '#fff'
      }}>
        <Box sx={{
          position: 'absolute',
          top: '12px',
          right: '10px',
          cursor: 'pointer'
        }}>
          <CancelIcon color="error" sx={{ '&:hover': { color: 'error.light' } }} onClick={handleCloseModal} />
        </Box>

        {activeCard?.cover &&
          <Box sx={{ mb: 4 }}>
            <img
              style={{ width: '100%', height: '320px', borderRadius: '6px', objectFit: 'cover' }}
              src={activeCard?.cover}
              alt="card-cover"
            />
          </Box>
        }

        <Box sx={{ mb: 1, mt: -3, pr: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon />

          {/* Feature 01: Xử lý tiêu đề của Card */}
          <ToggleFocusInput
            inputFontSize='22px'
            value={activeCard?.title}
            onChangedValue={onUpdateCardTitle} />
        </Box>

        {/* Members section - full width */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Members</Typography>

          {/* Feature 02: Xử lý các thành viên của Card */}
          <CardUserGroup
            cardMemberIds={activeCard?.memberIds}
            onUpdateCardMembers={onUpdateCardMembers}
          />
        </Box>

        {/* Add to card buttons - horizontal layout */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Add To Card</Typography>
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              flexWrap: 'wrap', 
              gap: 1,
              '& .MuiBox-root': {
                minWidth: '120px',
                maxWidth: '150px',
                flex: '1 1 auto',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => theme.palette.mode === 'dark' 
                    ? '0 2px 4px rgba(255, 255, 255, 0.1)' 
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                }
              }
            }}
          >
            {/* Feature 05: Xử lý hành động bản thân user tự join vào card */}
            {/* Nếu user hiện tại đang đăng nhập chưa thuộc mảng memberIds của card thì mới cho hiện nút Join và ngược lại */}
            {activeCard?.memberIds?.includes(currentUser._id)
              ? <SidebarItem
                sx={{ color: 'error.light', '&:hover': { color: 'error.light' } }}
                onClick={() => onUpdateCardMembers({
                  userId: currentUser._id,
                  action: CARD_MEMBER_ACTIONS.REMOVE
                })}
              >
                <ExitToAppIcon fontSize="small" />
                Leave
              </SidebarItem>
              : <SidebarItem
                className="active"
                onClick={() => onUpdateCardMembers({
                  userId: currentUser._id,
                  action: CARD_MEMBER_ACTIONS.ADD
                })}
              >
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PersonOutlineOutlinedIcon fontSize="small" />
                    <span>Join</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#27ae60' }} />
                  </Box>
                </Box>
              </SidebarItem>
            }

            {/* Feature 06: Xử lý hành động cập nhật ảnh Cover của Card */}
            <SidebarItem className="active" component="label">
              <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageOutlinedIcon fontSize="small" />
                  <span>Cover</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon fontSize="small" sx={{ color: '#27ae60' }} />
                </Box>
              </Box>
              <VisuallyHiddenInput type="file" onChange={onUploadCardCover} />
            </SidebarItem>

            <SidebarItem><AttachFileOutlinedIcon fontSize="small" />Attachment</SidebarItem>
            <SidebarItem><LocalOfferOutlinedIcon fontSize="small" />Labels</SidebarItem>
            <SidebarItem><TaskAltOutlinedIcon fontSize="small" />Checklist</SidebarItem>

            {/* "Thêm" Button */}
            <SidebarItem
              id="more-actions-button"
              aria-controls={openMoreMenu ? 'more-actions-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openMoreMenu ? 'true' : undefined}
              onClick={handleMoreMenuClick}
            >
              Thêm
            </SidebarItem>
            <Menu
              id="more-actions-menu"
              anchorEl={anchorEl}
              open={openMoreMenu}
              onClose={handleMoreMenuClose}
              MenuListProps={{
                'aria-labelledby': 'more-actions-button'
              }}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: '8px',
                  boxShadow: (theme) => theme.palette.mode === 'dark' 
                    ? '0 0 8px rgba(255, 255, 255, 0.1)' 
                    : '0 0 8px rgba(0, 0, 0, 0.1)',
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#fff',
                },
                '& .MuiList-root': {
                  padding: '8px',
                },
                '& .MuiMenuItem-root': {
                  borderRadius: '4px',
                  padding: '8px 12px',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[100],
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              TransitionProps={{ timeout: 200 }}
            >
              <MenuItem 
                onClick={() => { 
                  toast.info('Tính năng Dates đang được phát triển');
                  handleMoreMenuClose(); 
                }}
                sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                  <WatchLaterOutlinedIcon fontSize="small" />
                  <span>Dates</span>
                </Box>
              </MenuItem>
              <MenuItem 
                onClick={() => { 
                  toast.info('Tính năng Custom Fields đang được phát triển');
                  handleMoreMenuClose(); 
                }}
                sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                  <AutoFixHighOutlinedIcon fontSize="small" />
                  <span>Custom Fields</span>
                </Box>
              </MenuItem>
            </Menu>
          </Stack>
        </Box>

        {/* Description and Comments - side by side layout */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Description - Left side */}
          <Grid xs={12} sm={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SubjectRoundedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Description</Typography>
              </Box>

              {/* Feature 03: Xử lý mô tả của Card với scroll */}
              <Box sx={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : '#a8a8a8',
                  },
                },
              }}>
                <CardDescriptionMdEditor
                  cardDescriptionProp={activeCard?.description}
                  handleUpdateCardDescription={onUpdateCardDescription}
                />
              </Box>
            </Box>
          </Grid>

          {/* Comments - Right side */}
          <Grid xs={12} sm={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DvrOutlinedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Activity</Typography>
              </Box>

              {/* Feature 04: Xử lý các hành động, ví dụ comment vào Card với scroll */}
              <Box sx={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#64b5f6' : '#a8a8a8',
                  },
                },
              }}>
                <CardActivitySection
                  cardComments={activeCard?.comments}
                  onAddCardComment={onAddCardComment}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        
      </Box>
    </Modal>
  )
}

export default ActiveCard
