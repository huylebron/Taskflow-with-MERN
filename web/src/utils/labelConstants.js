import { COLUMN_COLORS } from './constants'

// Predefined label colors - sử dụng một số màu từ COLUMN_COLORS
export const LABEL_COLORS = {
  GREEN: '#61bd4f',
  YELLOW: '#f2d600',
  ORANGE: '#ff9f1a',
  RED: '#eb5a46',
  PURPLE: '#c377e0',
  BLUE: '#0079bf',
  SKY: '#00c2e0',
  LIME: '#51e898',
  PINK: '#ff78cb',
  BLACK: '#344563',
  GREY: '#b3bac5'
}

// Utility để tạo ID ngẫu nhiên cho labels
export const generateLabelId = () => {
  return `label-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

// Predefined labels - Mock Data
export const PREDEFINED_LABELS = [
  {
    id: 'label-001',
    name: 'Bug',
    color: LABEL_COLORS.RED
  },
  {
    id: 'label-002',
    name: 'Feature',
    color: LABEL_COLORS.GREEN
  },
  {
    id: 'label-003',
    name: 'Enhancement',
    color: LABEL_COLORS.BLUE
  },
  {
    id: 'label-004',
    name: 'Documentation',
    color: LABEL_COLORS.PURPLE
  },
  {
    id: 'label-005',
    name: 'Design',
    color: LABEL_COLORS.ORANGE
  },
  {
    id: 'label-006',
    name: 'Question',
    color: LABEL_COLORS.YELLOW
  },
  {
    id: 'label-007',
    name: 'Refactor',
    color: LABEL_COLORS.SKY
  },
  {
    id: 'label-008',
    name: 'Test',
    color: LABEL_COLORS.LIME
  },
  {
    id: 'label-009',
    name: 'High Priority',
    color: LABEL_COLORS.BLACK
  },
  {
    id: 'label-010',
    name: 'Low Priority',
    color: LABEL_COLORS.GREY
  },
  {
    id: 'label-011',
    name: 'Frontend',
    color: LABEL_COLORS.PINK
  },
  {
    id: 'label-012',
    name: 'Backend',
    color: LABEL_COLORS.BLUE
  }
]

// Mock data cho cardLabels example
export const MOCK_CARD_LABELS = ['label-001', 'label-003', 'label-006'] 