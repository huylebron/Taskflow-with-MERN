import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Avatar from '@mui/material/Avatar';
import ListAltIcon from '@mui/icons-material/ListAlt';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'incomplete', label: 'Chưa hoàn thành' }
];

const DUE_DATE_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'overdue', label: 'Quá hạn' },
  { value: 'soon', label: 'Sắp đến hạn (3 ngày tới)' },
  { value: 'none', label: 'Không có hạn' }
];

export default function FilterDrawer({ open, onClose, onApply, onClear, initialStatus = 'all', labels = [], initialSelectedLabels = [], members = [], initialSelectedMember = '', initialDueDateFilter = 'all', columns = [], initialSelectedColumn = '' }) {
  const [status, setStatus] = useState(initialStatus);
  const [selectedLabels, setSelectedLabels] = useState(initialSelectedLabels);
  const [selectedMember, setSelectedMember] = useState(initialSelectedMember);
  const [dueDateFilter, setDueDateFilter] = useState(initialDueDateFilter);
  const [selectedColumn, setSelectedColumn] = useState(initialSelectedColumn);

  const handleApply = () => {
    onApply({ status, labels: selectedLabels, member: selectedMember, dueDate: dueDateFilter, column: selectedColumn });
    onClose();
  };

  const handleClear = () => {
    setStatus('all');
    setSelectedLabels([]);
    setSelectedMember('');
    setDueDateFilter('all');
    setSelectedColumn('');
    onClear && onClear();
  };

  const handleToggleLabel = (labelId) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 320, p: 3 }} role="presentation">
        <Typography variant="h6" gutterBottom>Bộ lọc tổng hợp</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle1" gutterBottom>Trạng thái hoàn thành</Typography>
        <RadioGroup
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map(opt => (
            <FormControlLabel key={opt.value} value={opt.value} control={<Radio />} label={opt.label} />
          ))}
        </RadioGroup>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>Label</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {labels.length === 0 && <Typography variant="body2" color="text.secondary">Không có label nào</Typography>}
          {labels.map(label => (
            <Chip
              key={label.id || label._id}
              label={label.name || label.title}
              style={{
                backgroundColor: label.color,
                color: '#fff',
                border: selectedLabels.includes(label.id || label._id)
                  ? '2px solid #1976d2'
                  : '1px solid #fff',
                boxShadow: selectedLabels.includes(label.id || label._id)
                  ? '0 0 0 2px #1976d2' : undefined
              }}
              clickable
              variant={selectedLabels.includes(label.id || label._id) ? 'filled' : 'outlined'}
              onClick={() => handleToggleLabel(label.id || label._id)}
            />
          ))}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>Thành viên</Typography>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="filter-member-label">Chọn thành viên</InputLabel>
          <Select
            labelId="filter-member-label"
            value={selectedMember}
            label="Chọn thành viên"
            onChange={e => setSelectedMember(e.target.value)}
            renderValue={selected => {
              const user = members.find(m => m._id === selected || m.id === selected)
              return user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={user.avatar} sx={{ width: 24, height: 24 }}>{user.displayName?.[0]}</Avatar>
                  <span>{user.displayName || user.name || user.email}</span>
                </Box>
              ) : 'Chọn thành viên';
            }}
          >
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            {members.map(user => (
              <MenuItem key={user._id || user.id} value={user._id || user.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={user.avatar} sx={{ width: 24, height: 24 }}>{user.displayName?.[0]}</Avatar>
                  <span>{user.displayName || user.name || user.email}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>Hạn</Typography>
        <RadioGroup
          value={dueDateFilter}
          onChange={e => setDueDateFilter(e.target.value)}
          sx={{ mb: 2 }}
        >
          {DUE_DATE_OPTIONS.map(opt => (
            <FormControlLabel key={opt.value} value={opt.value} control={<Radio />} label={opt.label} />
          ))}
        </RadioGroup>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>Cột</Typography>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="filter-column-label">Chọn cột</InputLabel>
          <Select
            labelId="filter-column-label"
            value={selectedColumn}
            label="Chọn cột"
            onChange={e => setSelectedColumn(e.target.value)}
            renderValue={selected => {
              const col = columns.find(c => c._id === selected)
              return col ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ListAltIcon fontSize="small" />
                  <span>{col.title}</span>
                </Box>
              ) : 'Tất cả';
            }}
          >
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            {columns.map(col => (
              <MenuItem key={col._id} value={col._id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ListAltIcon fontSize="small" />
                  <span>{col.title}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button variant="contained" color="primary" onClick={handleApply}>Áp dụng</Button>
          <Button variant="outlined" color="secondary" onClick={handleClear}>Xóa lọc</Button>
        </Box>
      </Box>
    </Drawer>
  );
} 