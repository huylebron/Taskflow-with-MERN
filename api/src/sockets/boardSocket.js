export const boardSocket = (io, socket) => {
  // Client join vào room board
  socket.on('joinBoard', (boardId) => {
    socket.join(boardId)
  })

  // Khi có thao tác move card, emit tới room
  socket.on('FE_CARD_MOVED', (data) => {
    // data cần chứa boardId, cardId, fromColumnId, toColumnId, ...
    io.to(data.boardId).emit('BE_CARD_MOVED', data)
  })

  // Khi có thao tác move column, emit tới room
  socket.on('FE_COLUMN_MOVED', (data) => {
    // data cần chứa boardId, columnOrderIds
    io.to(data.boardId).emit('BE_COLUMN_MOVED', data)
  })

  // Cập nhật tên cột
  socket.on('FE_COLUMN_UPDATED', (data) => {
    socket.to(data.boardId).emit('BE_COLUMN_UPDATED', data)
  })

  // Cập nhật tên card
  socket.on('FE_CARD_UPDATED', (data) => {
    socket.to(data.boardId).emit('BE_CARD_UPDATED', data)
  })

  // Cập nhật label
  socket.on('FE_LABEL_UPDATED', (data) => {
    socket.to(data.boardId).emit('BE_LABEL_UPDATED', data)
  })

  // Thêm cột realtime
  socket.on('FE_COLUMN_CREATED', (data) => {
    socket.to(data.boardId).emit('BE_COLUMN_CREATED', data)
  })

  // Xoá cột realtime
  socket.on('FE_COLUMN_DELETED', (data) => {
    socket.to(data.boardId).emit('BE_COLUMN_DELETED', data)
  })

  // Di chuyển card trong cùng cột realtime
  socket.on('FE_CARD_SORTED_IN_COLUMN', (data) => {
    socket.to(data.boardId).emit('BE_CARD_SORTED_IN_COLUMN', data)
  })
} 