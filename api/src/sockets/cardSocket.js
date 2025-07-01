export const cardSocket = (io, socket) => {
  // Client join vào room board
  socket.on('joinBoard', (boardId) => {
    socket.join(boardId)
  })

  // Khi có bình luận mới, emit tới room
  socket.on('FE_NEW_COMMENT', (data) => {
    // data cần chứa boardId, cardId, comment
    io.to(data.boardId).emit('BE_NEW_COMMENT', data)
  })

  // Xoá card realtime
  socket.on('FE_CARD_DELETED', (data) => {
    socket.to(data.boardId).emit('BE_CARD_DELETED', data)
  })

  // Xóa checklist realtime - Universal Notifications Pattern ✅
  socket.on('FE_CHECKLIST_DELETED', (data) => {
    const enhancedData = { 
      ...data, 
      timestamp: new Date().toISOString() 
    }
    console.log('🔄 Socket FE_CHECKLIST_DELETED received:', enhancedData)
    io.to(data.boardId).emit('BE_CHECKLIST_DELETED', enhancedData) // ALL members
    console.log('🔄 Socket: Broadcasted checklist deletion to all board members')
  })

  // Xóa checklist item realtime - Universal Notifications Pattern ✅  
  socket.on('FE_CHECKLIST_ITEM_DELETED', (data) => {
    const enhancedData = { 
      ...data, 
      timestamp: new Date().toISOString() 
    }
    console.log('🔄 Socket FE_CHECKLIST_ITEM_DELETED received:', enhancedData)
    io.to(data.boardId).emit('BE_CHECKLIST_ITEM_DELETED', enhancedData) // ALL members
    console.log('🔄 Socket: Broadcasted checklist item deletion to all board members')
  })
} 