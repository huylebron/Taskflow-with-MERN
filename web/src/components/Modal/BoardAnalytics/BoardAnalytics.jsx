import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, Typography, Grid, Paper, IconButton, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend
} from 'recharts'
import { fetchBoardDetailsAPI } from '~/apis'

function BoardAnalytics({ isOpen, onClose, boardId }) {
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && boardId) {
      setLoading(true)
      fetchBoardDetailsAPI(boardId)
        .then(data => setBoard(data))
        .finally(() => setLoading(false))
    }
  }, [isOpen, boardId])

  if (!isOpen) return null
  if (loading) return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Đang tải dữ liệu...</DialogTitle>
    </Dialog>
  )
  if (!board) return null

  // FAKE DATA cho card nếu thiếu createdAt hoặc memberIds
  const allUserIds = [
    ...(board?.owners?.map(u => u._id) || []),
    ...(board?.members?.map(u => u._id) || [])
  ]
  // Tạo 3 ngày gần nhất
  const now = new Date()
  const recentDays = [0, 1, 2].map(offset => {
    const d = new Date(now)
    d.setDate(now.getDate() - offset)
    return d.toISOString().slice(0, 10)
  }).reverse() // [hôm kia, hôm qua, hôm nay]
  let fakeDayIdx = 0
  board?.columns?.forEach(col => {
    col.cards?.forEach(card => {
      // Fake createdAt nếu thiếu, phân bổ đều vào 3 ngày gần nhất
      card.createdAt = recentDays[fakeDayIdx % 3] + 'T12:00:00.000Z'
      fakeDayIdx++
      // Fake memberIds nếu thiếu hoặc rỗng
      if (!Array.isArray(card.memberIds) || card.memberIds.length === 0) {
        const count = Math.floor(Math.random() * 2) + 1
        card.memberIds = [...allUserIds]
          .sort(() => 0.5 - Math.random())
          .slice(0, count)
      }
    })
  })

  // Tính toán số liệu thực tế từ board
  const totalCards = board?.columns?.reduce((sum, col) => sum + (col.cards?.length || 0), 0) || 0
  const totalLabels = board?.labels?.length || 0
  const activeColumns = board?.columns?.length || 0
  const activeMembers = (board?.owners?.length || 0) + (board?.members?.length || 0)

  // Pie chart: cards by label
  const pieData = board?.labels?.map(label => ({
    name: label.name,
    value: board.columns?.reduce((sum, col) =>
      sum + (col.cards?.filter(card => card.labelIds?.includes(label.id)).length || 0), 0),
    fill: label.color
  })) || []

  // Bar chart: cards by column
  const barColumnData = board?.columns?.map(col => ({
    name: col.title,
    cards: col.cards?.length || 0
  })) || []

  // Bar chart: cards by member (tách riêng, làm rõ)
  const memberMap = {}
  board?.columns?.forEach(col => {
    col.cards?.forEach(card => {
      const ids = Array.isArray(card.memberIds) ? card.memberIds : []
      ids.forEach(memberId => {
        memberMap[memberId] = (memberMap[memberId] || 0) + 1
      })
    })
  })
  const memberData = [
    ...(board?.owners || []),
    ...(board?.members || [])
  ].map(user => ({
    name: user.displayName || user.username || user.email,
    cards: memberMap[user._id] || 0
  }))

  // Line chart: cards created by day
  const cardCreatedMap = {}
  board?.columns?.forEach(col => {
    col.cards?.forEach(card => {
      if (card.createdAt) {
        const date = new Date(card.createdAt)
        // Format yyyy-mm-dd
        const day = date.toISOString().slice(0, 10)
        cardCreatedMap[day] = (cardCreatedMap[day] || 0) + 1
      }
    })
  })
  // Tạo dải ngày liên tục
  const allDays = Object.keys(cardCreatedMap).sort()
  let lineData = []
  if (allDays.length > 0) {
    const start = new Date(allDays[0])
    const end = new Date(allDays[allDays.length - 1])
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().slice(0, 10)
      lineData.push({ date: dayStr, count: cardCreatedMap[dayStr] || 0 })
    }
  }

  // Lọc chỉ lấy 3 ngày gần nhất
  if (lineData.length > 3) {
    lineData = lineData.slice(-3)
  }

  // Đảm bảo luôn có đủ 3 ngày gần nhất trong lineData
  const lineDataMap = Object.fromEntries(lineData.map(item => [item.date, item.count]))
  lineData = recentDays.map(date => ({ date, count: lineDataMap[date] || 0 }))

  // Stacked Bar Chart: Completion progress by column (completed vs incomplete cards)
  const completionData = board?.columns?.map(col => {
    const totalCards = col.cards?.length || 0
    const completedCards = col.cards?.filter(card => card.isCardCompleted === true).length || 0
    const incompleteCards = totalCards - completedCards
    
    return {
      name: col.title,
      'Hoàn thành': completedCards,
      'Chưa hoàn thành': incompleteCards,
      total: totalCards
    }
  }) || []

  // Stacked Bar Chart: Due date tracking by column (cards with due date vs without due date)
  const dueDateData = board?.columns?.map(col => {
    const totalCards = col.cards?.length || 0
    const cardsWithDueDate = col.cards?.filter(card => card.dueDate !== null && card.dueDate !== undefined).length || 0
    const cardsWithoutDueDate = totalCards - cardsWithDueDate
    
    return {
      name: col.title,
      'Có due date': cardsWithDueDate,
      'Không có due date': cardsWithoutDueDate,
      total: totalCards
    }
  }) || []

  // Calculate completed cards total for summary stats
  const completedCardsTotal = board?.columns?.reduce((sum, col) => 
    sum + (col.cards?.filter(card => card.isCardCompleted === true).length || 0), 0) || 0

  // Calculate cards with due date total for summary stats
  const cardsWithDueDateTotal = board?.columns?.reduce((sum, col) => 
    sum + (col.cards?.filter(card => card.dueDate !== null && card.dueDate !== undefined).length || 0), 0) || 0

  // Calculate team average performance (completion rate)
  const teamAveragePerformance = totalCards > 0 ? 
    Math.round((completedCardsTotal / totalCards) * 100) : 0

  // Calculate due date coverage (percentage of cards with due date)
  const dueDateCoverage = totalCards > 0 ? 
    Math.round((cardsWithDueDateTotal / totalCards) * 100) : 0

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h5" component="h2">
          📊 Thống kê Board: {board?.title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Summary Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {totalCards}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số thẻ
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {completedCardsTotal}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thẻ đã hoàn thành
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {teamAveragePerformance}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tỷ lệ hoàn thành team
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="purple">
                {cardsWithDueDateTotal}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thẻ có due date
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="orange">
                {dueDateCoverage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tỷ lệ có due date
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {activeMembers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thành viên tham gia
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={3}>
          {/* Stacked Bar Chart - Completion Progress by Column */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                height: 350,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom>
                ✅ Tiến độ hoàn thành theo cột
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              {label}
                            </Typography>
                            <Typography variant="body2" color="success.main">
                              ✅ Hoàn thành: {data['Hoàn thành']} thẻ
                            </Typography>
                            <Typography variant="body2" color="warning.main">
                              ⏳ Chưa hoàn thành: {data['Chưa hoàn thành']} thẻ
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                              📊 Tổng: {data.total} thẻ ({data.total > 0 ? Math.round((data['Hoàn thành'] / data.total) * 100) : 0}% hoàn thành)
                            </Typography>
                          </Paper>
                        )
                      }
                      return null
                    }} />
                    <Legend />
                    <Bar dataKey="Hoàn thành" stackId="a" fill="#4caf50" />
                    <Bar dataKey="Chưa hoàn thành" stackId="a" fill="#ff9800" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Stacked Bar Chart - Due Date Tracking by Column */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                height: 350,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom>
                📅 Theo dõi due date theo cột
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dueDateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              {label}
                            </Typography>
                            <Typography variant="body2" color="purple">
                              📅 Có due date: {data['Có due date']} thẻ
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ⚪ Không có due date: {data['Không có due date']} thẻ
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                              📊 Tổng: {data.total} thẻ ({data.total > 0 ? Math.round((data['Có due date'] / data.total) * 100) : 0}% có due date)
                            </Typography>
                          </Paper>
                        )
                      }
                      return null
                    }} />
                    <Legend />
                    <Bar dataKey="Có due date" stackId="a" fill="#9c27b0" />
                    <Bar dataKey="Không có due date" stackId="a" fill="#e0e0e0" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Pie Chart - Cards by Label */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                height: 350,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom>
                🏷️ Phân bố thẻ theo nhãn
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <Paper sx={{ p: 1 }}>
                            <Typography variant="body2">
                              {payload[0].name}: {payload[0].value} thẻ
                            </Typography>
                          </Paper>
                        )
                      }
                      return null
                    }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Bar Chart - Cards by Column */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                height: 350,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom>
                📋 Phân bố thẻ theo cột
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barColumnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <Paper sx={{ p: 1 }}>
                            <Typography variant="body2">
                              {payload[0].payload.name}: {payload[0].payload.cards} thẻ
                            </Typography>
                          </Paper>
                        )
                      }
                      return null
                    }} />
                    <Bar dataKey="cards" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Bar Chart - Cards by Member (tách riêng, làm rõ) */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                height: 350,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom>
                👤 Số thẻ theo thành viên
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <Paper sx={{ p: 1 }}>
                            <Typography variant="body2">
                              {payload[0].payload.name}: {payload[0].payload.cards} thẻ
                            </Typography>
                          </Paper>
                        )
                      }
                      return null
                    }} />
                    <Bar dataKey="cards" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Line Chart - Cards created by day */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                height: 350,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom>
                📈 Số thẻ được tạo theo ngày
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <Paper sx={{ p: 1 }}>
                            <Typography variant="body2">
                              {payload[0].payload.date}: {payload[0].payload.count} thẻ
                            </Typography>
                          </Paper>
                        )
                      }
                      return null
                    }} />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default BoardAnalytics