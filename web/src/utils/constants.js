let apiRoot = ''
// console.log('import.meta.env: ', import.meta.env)
// console.log('process.env: ', process.env)

// Môi trường Dev sẽ chạy localhost với port 8017
if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:8017'
}

// Môi trường Production sẽ cần api endpoint chuẩn của các bạn
if (process.env.BUILD_MODE === 'production') {
  // Lưu ý: Đây là domain ví dụ sau khi Deploy Production (xem video 75 và video 76 để hiểu rõ kiến thức phần này, còn hiện tại mình đã xóa domain này rồi, đừng cố truy cập làm gì =))
  apiRoot = 'https://trello-api-0gbu.onrender.com'
}
// console.log('🚀 ~ file: constants.js:7 ~ apiRoot:', apiRoot)
export const API_ROOT = apiRoot

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}

// Column colors - 20 màu cố định hài hòa với UI
export const COLUMN_COLORS = {
  BLUE: '#0079bf',
  LIGHT_BLUE: '#54a3ff',
  OCEAN: '#026aa7',
  ORANGE: '#d29034',
  PEACH: '#ffab4a',
  AMBER: '#ff8f00',
  GREEN: '#519839',
  LIME: '#4bbf6b',
  FOREST: '#2d5016',
  RED: '#b04632',
  CRIMSON: '#eb5a46',
  CHERRY: '#c9372c',
  PURPLE: '#89609e',
  VIOLET: '#9c27b0',
  INDIGO: '#6366f1',
  PINK: '#cd5a91',
  ROSE: '#e91e63',
  MAGENTA: '#e040fb',
  GREY: '#838c91',
  DARK_GREY: '#4f4f4f',
  NAVY: '#172b4d',
  TEAL: '#00897b',
  CYAN: '#00bcd4',
  YELLOW: '#f9c74f'
}
