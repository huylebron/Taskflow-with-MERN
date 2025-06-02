import React from 'react'
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

function BoardAnalytics({ isOpen, onClose, board }) {
  console.log('BoardAnalytics rendered', { isOpen, board: board?.title })
  
  // Mock data cứng cho demo stakeholder
  const mockPieData = [
    { name: 'Bug', value: 8, fill: '#f44336' },
    { name: 'Feature', value: 12, fill: '#2196f3' },
    { name: 'Enhancement', value: 6, fill: '#4caf50' },
    { name: 'Documentation', value: 4, fill: '#ff9800' },
    { name: 'Design', value: 3, fill: '#9c27b0' }
  ]

  const mockColumnData = [
    { name: 'To Do', cards: 9 },
    { name: 'In Progress', cards: 4 },
    { name: 'Done', cards: 4 },
    { name: 'Blocked', cards: 2 }
  ]

  const mockDailyData = [
    { displayDate: '09/12', cards: 2 },
    { displayDate: '10/12', cards: 1 },
    { displayDate: '11/12', cards: 3 },
    { displayDate: '12/12', cards: 4 },
    { displayDate: '13/12', cards: 2 },
    { displayDate: '14/12', cards: 5 },
    { displayDate: '15/12', cards: 3 }
  ]

  const mockMemberData = [
    { name: 'hoa nguyennguyen', cards: 6 },
    { name: 'hunghung', cards: 4 },
    { name: 'huyhuy', cards: 5 },
    { name: 'Phạm Minh fgdfgd', cards: 3 }
  ]

  // Stats summary
  const totalCards = mockPieData.reduce((sum, item) => sum + item.value, 0)
  const totalLabels = mockPieData.length
  const activeColumns = mockColumnData.length
  const activeMembers = mockMemberData.length
  
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
                Tổng số Cards
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                {totalLabels}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Labels được sử dụng
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {activeColumns}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Columns hoạt động
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
                🏷️ Phân bố theo nhãn
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {mockPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
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
                📋 Phân bố theo cột
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockColumnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cards" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Line Chart - Cards by Day */}
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
                📅 Cards tạo trong 7 ngày
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockDailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="displayDate"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => `Ngày: ${label}`}
                      formatter={(value) => [value, 'Cards được tạo']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cards" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
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
                👥 Cards theo thành viên
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockMemberData}>
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
                    <Tooltip />
                    <Bar dataKey="cards" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Demo Note */}
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'primary.50' }}>
          <Typography variant="body2" color="primary" gutterBottom>
            📝 <strong>Demo Note:</strong> Đây là mock data để demo cho stakeholder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Pie Chart: 5 labels với 33 cards tổng cộng<br/>
            • Bar Chart: 4 columns hoạt động<br/>
            • Line Chart: Trend 7 ngày gần nhất<br/>
            • Member Chart: 4 thành viên tham gia<br/>
            → Khi tích hợp backend, data sẽ được lấy từ API thực tế
          </Typography>
        </Paper>
      </DialogContent>
    </Dialog>
  )
}

export default BoardAnalytics 