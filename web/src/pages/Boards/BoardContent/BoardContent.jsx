import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'

import {
  DndContext,
  // PointerSensor,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors'

import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState, useCallback, useRef } from 'react'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'

import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { toast } from 'react-toastify'
import { socketIoInstance } from '~/socketClient'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentActiveBoard, updateCardInBoard } from '~/redux/activeBoard/activeBoardSlice'
import FilterDrawer from '~/components/Modal/FilterDrawer'
import Button from '@mui/material/Button'
import FilterAltIcon from '@mui/icons-material/FilterAlt'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

// Custom Drop Animation cho DragOverlay
const customDropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5'
      }
    }
  })
}

function BoardContent({
  board,
  moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifferentColumn,
  filterDrawerOpen,
  setFilterDrawerOpen
}) {
  // Thêm function play shake sound
  const playShakeSound = () => {
    // Tạo subtle sound effect
    if (typeof Audio !== 'undefined') {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.2)
      } catch (error) {
        // Fail silently if audio not supported
      }
    }
  }
  // https://docs.dndkit.com/api-documentation/sensors
  // Nếu dùng PointerSensor mặc định thì phải kết hợp thuộc tính CSS touch-action: none ở những phần tử kéo thả - nhưng mà còn bug
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // Yêu cầu chuột di chuyển 5px thì mới kích hoạt event cho column drag mượt mà hơn
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 5 } })

  // Nhấn giữ 150ms và dung sai 300px cho responsive hơn
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 300 } })

  // Ưu tiên sử dụng kết hợp 2 loại sensors là mouse và touch để có trải nghiệm trên mobile tốt nhất, không bị bug.
  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  // Cùng một thời điểm chỉ có một phần tử đang được kéo (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // State để quản lý shake animation
  const [shakeItemId, setShakeItemId] = useState(null)

  // Điểm va chạm cuối cùng trước đó (xử lý thuật toán phát hiện va chạm, video 37)
  const lastOverId = useRef(null)

  const activeBoard = useSelector(selectCurrentActiveBoard)
  const dispatch = useDispatch()

  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedLabels, setSelectedLabels] = useState([])
  const [selectedMember, setSelectedMember] = useState('')
  const [dueDateFilter, setDueDateFilter] = useState('all')
  const [selectedColumn, setSelectedColumn] = useState('')
  const boardLabels = board?.labels || []
  const boardMembers = board?.FE_allUsers || []
  const boardColumns = board?.columns || []

  useEffect(() => {
    // Columns đã được sắp xếp ở component cha cao nhất (boards/_id.jsx) (Video 71 đã giải thích lý do)
    setOrderedColumns(board.columns)
  }, [board])

  useEffect(() => {
    const handleCardStatusChanged = (data) => {
      if (data.boardId === activeBoard?._id) {
        // Cập nhật trạng thái card trong board
        dispatch(updateCardInBoard({
          _id: data.cardId,
          isCardCompleted: data.isCardCompleted,
          columnId: data.columnId
        }))
        toast.info(
          data.isCardCompleted
            ? 'Một thẻ đã được đánh dấu hoàn thành!'
            : 'Một thẻ đã bỏ đánh dấu hoàn thành!',
          { position: 'bottom-right' }
        )
      }
    }
    socketIoInstance.on('CARD_COMPLETED_STATUS_CHANGED', handleCardStatusChanged)
    return () => {
      socketIoInstance.off('CARD_COMPLETED_STATUS_CHANGED', handleCardStatusChanged)
    }
  }, [activeBoard?._id, dispatch])

  // Tìm một cái Column theo CardId
  const findColumnByCardId = (cardId) => {
    // Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vì ở bước handleDragOver chúng ta sẽ làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới.
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // Khởi tạo Function chung xử lý việc cập nhật lại state trong trường hợp di chuyển Card giữa các Column khác nhau.
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumns(prevColumns => {
      // Tìm vị trí (index) của cái overCard trong column đích (nơi mà activeCard sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      // Logic tính toán "cardIndex mới" (trên hoặc dưới của overCard) lấy chuẩn ra từ code của thư viện - nhiều khi muốn từ chối hiểu =))
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      // nextActiveColumn: Column cũ
      if (nextActiveColumn) {
        // Xóa card ở cái column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Thêm Placeholder Card nếu Column rỗng: Bị kéo hết Card đi, không còn cái nào nữa. (Video 37.2)
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }

        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      // nextOverColumn: Column mới
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card giữa 2 column khác nhau.
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)

        // Xóa cái Placeholder Card đi nếu nó đang tồn tại (Video 37.2)
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)

        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      // Nếu function này được gọi từ handleDragEnd nghĩa là đã kéo thả xong, lúc này mới xử lý gọi API 1 lần ở đây
      if (triggerFrom === 'handleDragEnd') {
        /**
         * Gọi lên props function moveCardToDifferentColumn nằm ở component cha cao nhất (boards/_id.jsx)
         * Lưu ý: Về sau ở học phần MERN Stack Advance nâng cao học trực tiếp mình sẽ với mình thì chúng ta sẽ đưa dữ liệu Board ra ngoài Redux Global Store,
         * và lúc này chúng ta có thể gọi luôn API ở đây là xong thay vì phải lần lượt gọi ngược lên những component cha phía bên trên. (Đối với component con nằm càng sâu thì càng khổ :D)
         * - Với việc sử dụng Redux như vậy thì code sẽ Clean chuẩn chỉnh hơn rất nhiều.
         */
        // Phải dùng tới activeDragItemData.columnId hoặc tốt nhất là oldColumnWhenDraggingCard._id (set vào state từ bước handleDragStart) chứ không phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver và tới đây là state của card đã bị cập nhật một lần rồi.
        moveCardToDifferentColumn(
          activeDraggingCardId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        )
      }

      return nextColumns
    })
  }

  // Trigger khi bắt đầu kéo (drag) một phần tử
  const handleDragStart = (event) => {
    // console.log('handleDragStart: ', event)
    const { active } = event
    
    setActiveDragItemId(active?.id)
    setActiveDragItemType(active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(active?.data?.current)

    // Thêm sound effect
    playShakeSound()

    // Nếu là kéo card thì mới thực hiện hành động set giá trị oldColumn
    if (active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(active?.id))
    }
  }

  // Trigger trong quá trình kéo (drag) một phần tử
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu đang kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    // Còn nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các columns
    // console.log('handleDragOver: ', event)
    const { active, over } = event

    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì (tránh crash trang)
    if (!active || !over) return

    // activeDraggingCard: Là cái card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên.
    const { id: overCardId } = over

    // Tìm 2 cái columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // Nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang web
    if (!activeColumn || !overColumn) return

    // Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card trong chính column ban đầu của nó thì không làm gì
    // Vì đây đang là đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác ở (handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }

  // Trigger khi kết thúc hành động kéo (drag) một phần tử => hành động thả (drop)
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd: ', event)
    const { active, over } = event

    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì (tránh crash trang)
    if (!active || !over) return

    // Xử lý kéo thả Cards
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCard: Là cái card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overCard: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên.
      const { id: overCardId } = over

      // Tìm 2 cái columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // Nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang web
      if (!activeColumn || !overColumn) return

      // Hành động kéo thả card giữa 2 column khác nhau
      // Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id (set vào state từ bước handleDragStart) chứ không phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card đã bị cập nhật một lần rồi.
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )
      } else {
        // Hành động kéo thả card trong cùng một cái column

        // Lấy vị trí cũ (từ thằng oldColumnWhenDraggingCard)
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // Lấy vị trí mới (từ thằng overColumn)
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)

        // Dùng arrayMove vì kéo card trong một cái column thì tương tự với logic kéo column trong một cái board content
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        const dndOrderedCardIds = dndOrderedCards.map(card => card._id)

        // Vẫn gọi update State ở đây để tránh delay hoặc Flickering giao diện lúc kéo thả cần phải chờ gọi API (small trick)
        setOrderedColumns(prevColumns => {
          // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)

          // Tìm tới cái Column mà chúng ta đang thả
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          // cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCardIds

          // Trả về giá trị state mới (chuẩn vị trí)
          return nextColumns
        })

        /**
         * Gọi lên props function moveCardInTheSameColumn nằm ở component cha cao nhất (boards/_id.jsx)
         * Lưu ý: Về sau ở học phần MERN Stack Advance nâng cao học trực tiếp mình sẽ với mình thì chúng ta sẽ đưa dữ liệu Board ra ngoài Redux Global Store,
         * và lúc này chúng ta có thể gọi luôn API ở đây là xong thay vì phải lần lượt gọi ngược lên những component cha phía bên trên. (Đối với component con nằm càng sâu thì càng khổ :D)
         * - Với việc sử dụng Redux như vậy thì code sẽ Clean chuẩn chỉnh hơn rất nhiều.
         */
        moveCardInTheSameColumn(dndOrderedCards, dndOrderedCardIds, oldColumnWhenDraggingCard._id)
      }
    }

    // Xử lý kéo thả Columns trong một cái boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        // Lấy vị trí cũ (từ thằng active)
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        // Lấy vị trí mới (từ thằng over)
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)

        // Dùng arrayMove của thằng dnd-kit để sắp xếp lại mảng Columns ban đầu
        // Code của arrayMove ở đây: dnd-kit/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)


        // Vẫn gọi update State ở đây để tránh delay hoặc Flickering giao diện lúc kéo thả cần phải chờ gọi API (small trick)
        setOrderedColumns(dndOrderedColumns)
        /**
         * Gọi lên props function moveColumns nằm ở component cha cao nhất (boards/_id.jsx)
         * Lưu ý: Về sau ở học phần MERN Stack Advance nâng cao học trực tiếp mình sẽ với mình thì chúng ta sẽ đưa dữ liệu Board ra ngoài Redux Global Store,
         * và lúc này chúng ta có thể gọi luôn API ở đây là xong thay vì phải lần lượt gọi ngược lên những component cha phía bên trên. (Đối với component con nằm càng sâu thì càng khổ :D)
        */
        moveColumns(dndOrderedColumns)
      }
    }

    // Trigger shake animation cho item vừa được thả
    if (activeDragItemId) {
      setShakeItemId(activeDragItemId)
      // Clear shake animation sau 700ms
      setTimeout(() => {
        setShakeItemId(null)
      }, 700)
    }

    // Những dữ liệu sau khi kéo thả này luôn phải đưa về giá trị null mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  // Chúng ta sẽ custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều columns (video 37 fix bug quan trọng)
  // args = arguments = Các Đối số, tham số
  const collisionDetectionStrategy = useCallback((args) => {
    // Trường hợp kéo column thì dùng thuật toán pointerWithin kết hợp closestCenter cho mượt mà hơn
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Sử dụng pointerWithin để detect tốt hơn khi kéo column
      const pointerCollision = pointerWithin(args)
      if (pointerCollision.length > 0) {
        return pointerCollision
      }
      // Fallback về closestCorners nếu không detect được với pointer
      return closestCorners({ ...args })
    }

    // Tìm các điểm giao nhau, va chạm, trả về một mảng các va chạm - intersections với con trỏ
    const pointerIntersections = pointerWithin(args)

    // Video 37.1: Nếu pointerIntersections là mảng rỗng, return luôn không làm gì hết.
    // Fix triệt để cái bug flickering của thư viện Dnd-kit trong trường hợp sau:
    //  - Kéo một cái card có image cover lớn và kéo lên phía trên cùng ra khỏi khu vực kéo thả
    if (!pointerIntersections?.length) return

    // // Thuật toán phát hiện va chạm sẽ trả về một mảng các va chạm ở đây (không cần bước này nữa - video 37.1)
    // const intersections = !!pointerIntersections?.length
    //   ? pointerIntersections
    //   : rectIntersection(args)

    // Tìm overId đầu tiên trong đám pointerIntersections ở trên
    let overId = getFirstCollision(pointerIntersections, 'id')
    if (overId) {
      // Video 37: Đoạn này để fix cái vụ flickering nhé.
      // Nếu cái over nó là column thì sẽ tìm tới cái cardId gần nhất bên trong khu vực va chạm đó dựa vào thuật toán phát hiện va chạm closestCenter hoặc closestCorners đều được. Tuy nhiên ở đây dùng closestCorners mình thấy mượt mà hơn.
      // Nếu không có đoạn checkColumn này thì bug flickering vẫn fix đc rồi nhưng mà kéo thả sẽ rất giật giật lag.
      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        // console.log('overId before: ', overId)
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
        // console.log('overId after: ', overId)
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    // Nếu overId là null thì trả về mảng rỗng - tránh bug crash trang
    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumns])

  // Hàm lọc card theo trạng thái hoàn thành, label, thành viên, hạn, cột
  const filterCard = (card, columnId) => {
    // Lọc trạng thái
    let statusOk = true
    if (filterStatus === 'completed') statusOk = card.isCardCompleted
    if (filterStatus === 'incomplete') statusOk = !card.isCardCompleted
    // Lọc label
    let labelOk = true
    if (selectedLabels.length > 0) {
      labelOk = card.labelIds?.some(id => selectedLabels.includes(id))
    }
    // Lọc thành viên
    let memberOk = true
    if (selectedMember) {
      memberOk = card.memberIds?.includes(selectedMember)
    }
    // Lọc hạn
    let dueDateOk = true
    if (dueDateFilter !== 'all') {
      const now = new Date()
      const due = card.dueDate ? new Date(card.dueDate) : null
      if (dueDateFilter === 'overdue') dueDateOk = due && due < now
      if (dueDateFilter === 'soon') {
        const soon = new Date(now)
        soon.setDate(now.getDate() + 3)
        dueDateOk = due && due > now && due <= soon
      }
      if (dueDateFilter === 'none') dueDateOk = !due
    }
    // Lọc cột
    let columnOk = true
    if (selectedColumn) {
      columnOk = columnId === selectedColumn
    }
    return statusOk && labelOk && memberOk && dueDateOk && columnOk
  }

  return (
    <Box>
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApply={({ status, labels, member, dueDate, column }) => {
          setFilterStatus(status)
          setSelectedLabels(labels)
          setSelectedMember(member)
          setDueDateFilter(dueDate)
          setSelectedColumn(column)
        }}
        onClear={() => {
          setFilterStatus('all')
          setSelectedLabels([])
          setSelectedMember('')
          setDueDateFilter('all')
          setSelectedColumn('')
        }}
        initialStatus={filterStatus}
        labels={boardLabels}
        initialSelectedLabels={selectedLabels}
        members={boardMembers}
        initialSelectedMember={selectedMember}
        initialDueDateFilter={dueDateFilter}
        columns={boardColumns}
        initialSelectedColumn={selectedColumn}
      />
      <DndContext
        // Sử dụng collisionDetectionStrategy thay vì closestCorners để tránh bug flickering
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <Box sx={{
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'inherit' : 'inherit'),
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0',
          // Đảm bảo nội dung nằm trên overlay của background
          position: 'relative',
          zIndex: 1
        }}>
          <ListColumns
            columns={orderedColumns.map(col => ({
              ...col,
              cards: col.cards.filter(card => filterCard(card, col._id))
            }))}
            shakeItemId={shakeItemId}
            moveColumns={moveColumns}
            moveCardInTheSameColumn={moveCardInTheSameColumn}
            moveCardToDifferentColumn={moveCardToDifferentColumn}
          />

          <DragOverlay dropAnimation={customDropAnimation}>
            {!activeDragItemType && null}
            {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && (
              <div className="drag-active-column drag-placeholder-glow">
                <Column column={activeDragItemData} />
              </div>
            )}
            {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && (
              <div className="drag-active-card drag-placeholder-glow">
                <Card card={activeDragItemData} />
              </div>
            )}
          </DragOverlay>
        </Box>
      </DndContext>
    </Box>
  )
}

export default BoardContent
