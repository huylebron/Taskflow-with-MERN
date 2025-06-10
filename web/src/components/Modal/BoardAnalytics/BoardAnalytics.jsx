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

  // Bar chart: cards by member
  const memberMap = {}
  board?.columns?.forEach(col => {
    col.cards?.forEach(card => {
      card.memberIds?.forEach(memberId => {
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
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {totalCards}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số thẻ
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                {totalLabels}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Số nhãn được sử dụng
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {activeColumns}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Số cột đang hoạt động
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
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

          {/* Bar Chart - Cards by Member */}
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
                👥 Số thẻ theo thành viên
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
                    <Bar dataKey="cards" fill="#ffc658" />
                  </BarChart>
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