/**
 * YouTube: TrungQuanDev - Một Lập Trình Viên
 * Created by trungquandev.com's author on Jun 28, 2023
 */
export const mockData = {
  // Mở rộng labels cho calendar với nhiều màu sắc hơn
  labels: [
    { _id: 'label-01', title: 'Bug', color: '#f44336' },        // Đỏ
    { _id: 'label-02', title: 'Feature', color: '#2196f3' },    // Xanh dương
    { _id: 'label-03', title: 'Enhancement', color: '#4caf50' }, // Xanh lá
    { _id: 'label-04', title: 'Documentation', color: '#ff9800' }, // Cam
    { _id: 'label-05', title: 'Design', color: '#9c27b0' },     // Tím
    { _id: 'label-06', title: 'Testing', color: '#00bcd4' },    // Xanh cyan
    { _id: 'label-07', title: 'Deployment', color: '#795548' }, // Nâu
    { _id: 'label-08', title: 'Research', color: '#607d8b' },   // Xanh xám
    { _id: 'label-09', title: 'Meeting', color: '#e91e63' },    // Hồng
    { _id: 'label-10', title: 'Review', color: '#ffeb3b' }      // Vàng
  ],

  // Mở rộng users với nhiều thành viên hơn
  users: [
    { _id: 'user-01', displayName: 'Nguyen Van Hoa', avatar: 'avatar1.jpg' },
    { _id: 'user-02', displayName: 'Tran Minh Hung', avatar: 'avatar2.jpg' },
    { _id: 'user-03', displayName: 'Le Quang Huy', avatar: 'avatar3.jpg' },
    { _id: 'user-04', displayName: 'Pham Minh Duc', avatar: 'avatar4.jpg' },
    { _id: 'user-05', displayName: 'Vo Thi Mai', avatar: 'avatar5.jpg' },
    { _id: 'user-06', displayName: 'Nguyen Thai Son', avatar: 'avatar6.jpg' },
    { _id: 'user-07', displayName: 'Hoang Yen Nhi', avatar: 'avatar7.jpg' },
    { _id: 'user-08', displayName: 'Dang Minh Quan', avatar: 'avatar8.jpg' }
  ],

  board: {
    _id: 'board-id-01',
    title: 'TaskFlow MERN Stack Project',
    description: 'Advanced Full-Stack Development with Calendar Integration',
    type: 'public', // 'private'
    ownerIds: [], // Những users là Admin của board
    memberIds: [], // Những users là member bình thường của board
    columnOrderIds: ['column-id-01', 'column-id-02', 'column-id-03', 'column-id-04'], // Thứ tự sắp xếp / vị trí của các Columns trong 1 boards
    columns: [
      {
        _id: 'column-id-01',
        boardId: 'board-id-01',
        title: 'Backlog & Planning',
        cardOrderIds: ['card-id-01', 'card-id-02', 'card-id-03', 'card-id-04', 'card-id-05', 'card-id-06', 'card-id-07', 'card-id-14', 'card-id-15', 'card-id-20', 'card-id-21', 'card-id-22', 'card-id-23', 'card-id-24', 'card-id-40', 'card-id-41', 'card-id-42', 'card-id-43', 'card-id-44', 'card-id-45'],
        cards: [
          {
            _id: 'card-id-01',
            boardId: 'board-id-01',
            columnId: 'column-id-01',
            title: 'Fix mobile login authentication bug',
            description: 'Critical bug affecting user authentication on mobile Safari and Chrome browsers',
            cover: 'https://trungquandev.com/wp-content/uploads/2022/07/fair-mern-stack-advanced-banner-trungquandev.jpg',
            memberIds: ['user-01', 'user-05'],
            comments: ['Critical priority - affecting 30% users', 'Need urgent fix before production'],
            attachments: ['error-logs.txt', 'mobile-screenshots.png'],
            dueDate: '2024-12-17T09:00:00.000Z',  // Tomorrow morning
            labelIds: ['label-01', 'label-06'], // Bug + Testing
            createdAt: '2024-12-13T10:30:00.000Z',
            createdBy: 'user-01'
          },
          { 
            _id: 'card-id-02', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Implement OAuth2 social login integration', 
            description: 'Add Google, Facebook, GitHub login options for better user experience', 
            cover: null, 
            memberIds: ['user-02', 'user-06'], 
            comments: ['Research OAuth2 best practices', 'Security review required'], 
            attachments: ['oauth-diagram.pdf'],
            dueDate: '2024-12-20T16:00:00.000Z',  // Friday deadline
            labelIds: ['label-02', 'label-08'], // Feature + Research
            createdAt: '2024-12-14T14:15:00.000Z',
            createdBy: 'user-02'
          },
          { 
            _id: 'card-id-03', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Update comprehensive API documentation v2.0', 
            description: 'Complete overhaul of API docs with interactive examples and better structure', 
            cover: null, 
            memberIds: ['user-03', 'user-07'], 
            comments: ['Include Postman collection', 'Add code examples for each endpoint'], 
            attachments: ['api-v1-docs.md'],
            dueDate: '2024-12-18T12:00:00.000Z',  // Wednesday noon
            labelIds: ['label-04', 'label-03'], // Documentation + Enhancement
            createdAt: '2024-12-15T09:00:00.000Z',
            createdBy: 'user-03'
          },
          { 
            _id: 'card-id-04', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Design modern dashboard UI/UX mockups', 
            description: 'Create wireframes and high-fidelity mockups for new analytics dashboard', 
            cover: null, 
            memberIds: ['user-04', 'user-07'], 
            comments: ['Follow Material Design 3 guidelines', 'Include dark mode variants'], 
            attachments: ['current-design.figma'],
            dueDate: '2024-12-19T17:30:00.000Z',  // Thursday evening
            labelIds: ['label-05', 'label-02'], // Design + Feature
            createdAt: '2024-12-12T11:20:00.000Z',
            createdBy: 'user-04'
          },
          { 
            _id: 'card-id-05', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Optimize PostgreSQL database performance', 
            description: 'Implement indexing, query optimization, and connection pooling strategies', 
            cover: null, 
            memberIds: ['user-01', 'user-08'], 
            comments: ['Current slow queries identified', 'Need performance benchmarks'], 
            attachments: ['db-analysis.xlsx', 'slow-queries.sql'],
            dueDate: '2024-12-23T14:00:00.000Z',  // Next Monday
            labelIds: ['label-03', 'label-08'], // Enhancement + Research
            createdAt: '2024-12-11T15:45:00.000Z',
            createdBy: 'user-01'
          },
          { 
            _id: 'card-id-06', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Configure advanced CI/CD pipeline with Docker', 
            description: 'Setup automated testing, building, and deployment with GitHub Actions', 
            cover: null, 
            memberIds: ['user-02', 'user-08'], 
            comments: ['Include staging environment', 'Add automated security scanning'], 
            attachments: ['current-pipeline.yml'],
            dueDate: '2024-12-21T10:30:00.000Z',  // Saturday morning
            labelIds: ['label-07', 'label-04'], // Deployment + Documentation
            createdAt: '2024-12-10T08:30:00.000Z',
            createdBy: 'user-02'
          },
          { 
            _id: 'card-id-07', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Fix critical responsive design inconsistencies', 
            description: 'Address mobile and tablet layout issues across all major components', 
            cover: null, 
            memberIds: ['user-03', 'user-05'], 
            comments: ['Testing on iOS Safari needed', 'Bootstrap grid issues identified'], 
            attachments: ['responsive-test-report.pdf'],
            dueDate: '2024-12-18T08:00:00.000Z',  // Wednesday early morning
            labelIds: ['label-01', 'label-05'], // Bug + Design
            createdAt: '2024-12-09T13:15:00.000Z',
            createdBy: 'user-03'
          },
          { 
            _id: 'card-id-14', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Implement real-time WebSocket notifications system', 
            description: 'Build comprehensive push notification system with Socket.io and Redis', 
            cover: null, 
            memberIds: ['user-04', 'user-06'], 
            comments: ['Consider scaling for 10k+ concurrent users', 'Include email fallback'], 
            attachments: ['notification-architecture.png'],
            dueDate: '2025-01-15T12:00:00.000Z',  // Future sprint
            labelIds: ['label-02', 'label-08'], // Feature + Research
            createdAt: '2024-12-15T16:20:00.000Z',
            createdBy: 'user-04'
          },
          { 
            _id: 'card-id-15', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Complete unit test suite for authentication module', 
            description: 'Achieve 95%+ code coverage with Jest and React Testing Library', 
            cover: null, 
            memberIds: ['user-01', 'user-05'], 
            comments: ['Include integration tests', 'Mock external API calls'], 
            attachments: ['test-plan.md'],
            dueDate: '2024-12-22T15:00:00.000Z',  // Sunday afternoon
            labelIds: ['label-06', 'label-03'], // Testing + Enhancement
            createdAt: '2024-12-14T10:45:00.000Z',
            createdBy: 'user-01'
          },
          // Thêm nhiều cards mới với due dates đa dạng
          { 
            _id: 'card-id-20', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Weekly team standup meeting', 
            description: 'Regular sync meeting to discuss progress and blockers', 
            cover: null, 
            memberIds: ['user-01', 'user-02', 'user-03', 'user-04'], 
            comments: ['Prepare progress updates', 'Identify blockers early'], 
            attachments: [],
            dueDate: '2024-12-16T10:00:00.000Z',  // Tomorrow morning
            labelIds: ['label-09'], // Meeting
            createdAt: '2024-12-15T09:00:00.000Z',
            createdBy: 'user-02'
          },
          { 
            _id: 'card-id-21', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Research AI integration opportunities', 
            description: 'Explore ChatGPT API, auto-suggestions, and smart recommendations', 
            cover: null, 
            memberIds: ['user-06', 'user-07'], 
            comments: ['Focus on user productivity features', 'Cost analysis needed'], 
            attachments: ['ai-research-notes.md'],
            dueDate: '2024-12-25T16:00:00.000Z',  // Christmas day
            labelIds: ['label-08', 'label-02'], // Research + Feature
            createdAt: '2024-12-13T14:30:00.000Z',
            createdBy: 'user-06'
          },
          { 
            _id: 'card-id-22', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Security audit and penetration testing', 
            description: 'Comprehensive security review of authentication and data handling', 
            cover: null, 
            memberIds: ['user-08', 'user-01'], 
            comments: ['External security firm involved', 'Critical before production'], 
            attachments: ['security-checklist.pdf'],
            dueDate: '2024-12-30T09:00:00.000Z',  // End of year
            labelIds: ['label-06', 'label-01'], // Testing + Bug
            createdAt: '2024-12-12T16:45:00.000Z',
            createdBy: 'user-08'
          },
          { 
            _id: 'card-id-23', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Client feedback review session', 
            description: 'Analyze user feedback and prioritize feature requests', 
            cover: null, 
            memberIds: ['user-04', 'user-07'], 
            comments: ['500+ feedback items collected', 'Focus on top pain points'], 
            attachments: ['feedback-analysis.xlsx'],
            dueDate: '2024-12-17T14:00:00.000Z',  // Tomorrow afternoon
            labelIds: ['label-09', 'label-10'], // Meeting + Review
            createdAt: '2024-12-11T11:20:00.000Z',
            createdBy: 'user-04'
          },
          { 
            _id: 'card-id-24', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Performance monitoring setup with New Relic', 
            description: 'Implement comprehensive application performance monitoring', 
            cover: null, 
            memberIds: ['user-02', 'user-08'], 
            comments: ['Include custom dashboards', 'Alert thresholds configuration'], 
            attachments: ['monitoring-plan.pdf'],
            dueDate: '2024-12-24T11:30:00.000Z',  // Christmas Eve
            labelIds: ['label-07', 'label-03'], // Deployment + Enhancement
            createdAt: '2024-12-10T15:10:00.000Z',
            createdBy: 'user-02'
          },
          // ===== THÊM CARDS MỚI CHO THÁNG 5 & 6 năm 2025 =====
          { 
            _id: 'card-id-40', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Q2 2025 Product Roadmap Planning', 
            description: 'Strategic planning session for second quarter product initiatives and feature priorities', 
            cover: null, 
            memberIds: ['user-01', 'user-04', 'user-06'], 
            comments: ['Stakeholder input collected', 'Market research complete'], 
            attachments: ['q2-roadmap-draft.pptx', 'market-analysis.pdf'],
            dueDate: '2025-05-05T14:00:00.000Z',  // May 5th afternoon
            labelIds: ['label-09', 'label-10'], // Meeting + Review
            createdAt: '2025-04-20T09:30:00.000Z',
            createdBy: 'user-04'
          },
          { 
            _id: 'card-id-41', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Summer Mobile App v2.0 Feature Specification', 
            description: 'Detailed specifications for mobile app major version upgrade with new features', 
            cover: null, 
            memberIds: ['user-05', 'user-07', 'user-08'], 
            comments: ['iOS 17 compatibility required', 'Android 14 features integration'], 
            attachments: ['mobile-v2-specs.md', 'platform-requirements.xlsx'],
            dueDate: '2025-05-12T11:30:00.000Z',  // May 12th morning
            labelIds: ['label-02', 'label-04'], // Feature + Documentation
            createdAt: '2025-04-25T13:15:00.000Z',
            createdBy: 'user-05'
          },
          { 
            _id: 'card-id-42', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Annual Security Compliance Audit Preparation', 
            description: 'Prepare for ISO 27001 and SOC 2 Type II compliance audits scheduled for summer', 
            cover: null, 
            memberIds: ['user-08', 'user-01', 'user-03'], 
            comments: ['External auditor confirmed', 'Documentation review in progress'], 
            attachments: ['compliance-checklist.pdf', 'security-policies-v3.docx'],
            dueDate: '2025-05-20T09:00:00.000Z',  // May 20th morning
            labelIds: ['label-06', 'label-04'], // Testing + Documentation
            createdAt: '2025-04-30T10:45:00.000Z',
            createdBy: 'user-08'
          },
          { 
            _id: 'card-id-43', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Summer Internship Program Setup & Mentorship', 
            description: 'Organize summer internship program with mentorship assignments and project allocation', 
            cover: null, 
            memberIds: ['user-02', 'user-06', 'user-07'], 
            comments: ['5 interns confirmed', 'Project assignments ready'], 
            attachments: ['internship-program.pdf', 'mentor-guidelines.docx'],
            dueDate: '2025-06-01T16:00:00.000Z',  // June 1st afternoon (start of summer)
            labelIds: ['label-09', 'label-04'], // Meeting + Documentation
            createdAt: '2025-05-10T14:20:00.000Z',
            createdBy: 'user-02'
          },
          { 
            _id: 'card-id-44', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Mid-Year Performance Review & Goal Setting', 
            description: 'Conduct comprehensive performance reviews and set Q3-Q4 objectives for all team members', 
            cover: null, 
            memberIds: ['user-04', 'user-01', 'user-02'], 
            comments: ['Review templates updated', 'Goal tracking system ready'], 
            attachments: ['performance-review-template.xlsx', 'goal-setting-guide.pdf'],
            dueDate: '2025-06-15T10:00:00.000Z',  // Mid-June morning
            labelIds: ['label-09', 'label-10'], // Meeting + Review
            createdAt: '2025-05-25T11:30:00.000Z',
            createdBy: 'user-04'
          },
          { 
            _id: 'card-id-45', 
            boardId: 'board-id-01', 
            columnId: 'column-id-01', 
            title: 'Summer Product Launch Marketing Campaign', 
            description: 'Coordinate comprehensive marketing campaign for major product launch in late June', 
            cover: null, 
            memberIds: ['user-05', 'user-07', 'user-06'], 
            comments: ['Social media strategy approved', 'Influencer partnerships secured'], 
            attachments: ['marketing-campaign-plan.pptx', 'launch-timeline.gantt'],
            dueDate: '2025-06-25T13:45:00.000Z',  // June 25th afternoon
            labelIds: ['label-09', 'label-05'], // Meeting + Design
            createdAt: '2025-05-15T16:10:00.000Z',
            createdBy: 'user-05'
          }
        ]
      },
      {
        _id: 'column-id-02',
        boardId: 'board-id-01',
        title: 'In Progress & Active Development',
        cardOrderIds: ['card-id-08', 'card-id-09', 'card-id-10', 'card-id-16', 'card-id-25', 'card-id-26', 'card-id-27', 'card-id-28', 'card-id-46', 'card-id-47', 'card-id-48', 'card-id-49'],
        cards: [
          { 
            _id: 'card-id-08', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Implement advanced search with filters', 
            description: 'Add full-text search with date range, tags, and user filters', 
            cover: null, 
            memberIds: ['user-02', 'user-06'], 
            comments: ['ElasticSearch integration in progress', '70% completion'], 
            attachments: ['search-mockups.png', 'api-specs.json'],
            dueDate: '2024-12-18T16:30:00.000Z',  // Wednesday afternoon
            labelIds: ['label-02', 'label-03'], // Feature + Enhancement
            createdAt: '2024-12-13T12:00:00.000Z',
            createdBy: 'user-02'
          },
          { 
            _id: 'card-id-09', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Performance optimization for large datasets', 
            description: 'Optimize rendering and data fetching for 100k+ records', 
            cover: null, 
            memberIds: ['user-01', 'user-08'], 
            comments: ['Virtual scrolling implemented', 'Need caching strategy'], 
            attachments: ['performance-benchmarks.xlsx'],
            dueDate: '2024-12-19T11:00:00.000Z',  // Thursday morning
            labelIds: ['label-03', 'label-06'], // Enhancement + Testing
            createdAt: '2024-12-12T14:30:00.000Z',
            createdBy: 'user-01'
          },
          { 
            _id: 'card-id-10', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Code review for authentication refactor', 
            description: 'Review security improvements and breaking changes in auth system', 
            cover: null, 
            memberIds: ['user-03', 'user-05'], 
            comments: ['Security audit passed', 'Documentation needs update'], 
            attachments: ['auth-security-report.pdf'],
            dueDate: '2024-12-20T15:30:00.000Z',  // Friday afternoon
            labelIds: ['label-10', 'label-06'], // Review + Testing
            createdAt: '2024-12-11T16:00:00.000Z',
            createdBy: 'user-03'
          },
          { 
            _id: 'card-id-16', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Integration with third-party payment gateway', 
            description: 'Implement Stripe payment processing with webhook handlers', 
            cover: null, 
            memberIds: ['user-04', 'user-07'], 
            comments: ['Stripe Connect API configured', 'Testing sandbox environment'], 
            attachments: ['payment-flow-diagram.png', 'stripe-webhook-docs.pdf'],
            dueDate: '2024-12-23T13:45:00.000Z',  // Next Monday afternoon
            labelIds: ['label-02', 'label-08'], // Feature + Research
            createdAt: '2024-12-10T11:15:00.000Z',
            createdBy: 'user-04'
          },
          { 
            _id: 'card-id-25', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Mobile app push notifications', 
            description: 'Implement Firebase Cloud Messaging for iOS and Android', 
            cover: null, 
            memberIds: ['user-06', 'user-08'], 
            comments: ['Firebase setup complete', 'Testing notification targeting'], 
            attachments: ['fcm-setup-guide.md'],
            dueDate: '2024-12-21T09:15:00.000Z',  // Saturday morning
            labelIds: ['label-02', 'label-07'], // Feature + Deployment
            createdAt: '2024-12-09T10:30:00.000Z',
            createdBy: 'user-06'
          },
          { 
            _id: 'card-id-26', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Dashboard analytics widgets development', 
            description: 'Build interactive charts and KPI widgets for admin dashboard', 
            cover: null, 
            memberIds: ['user-05', 'user-07'], 
            comments: ['Chart.js integration done', 'Real-time data pending'], 
            attachments: ['dashboard-mockups.figma', 'chart-requirements.md'],
            dueDate: '2024-12-26T14:20:00.000Z',  // Day after Christmas
            labelIds: ['label-05', 'label-02'], // Design + Feature
            createdAt: '2024-12-08T13:45:00.000Z',
            createdBy: 'user-05'
          },
          { 
            _id: 'card-id-27', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Advanced user permission system', 
            description: 'Implement role-based access control with granular permissions', 
            cover: null, 
            memberIds: ['user-01', 'user-03'], 
            comments: ['Database schema updated', 'Frontend guards implemented'], 
            attachments: ['rbac-design.pdf', 'permission-matrix.xlsx'],
            dueDate: '2024-12-28T10:00:00.000Z',  // Saturday after Christmas
            labelIds: ['label-02', 'label-06'], // Feature + Testing
            createdAt: '2024-12-07T11:20:00.000Z',
            createdBy: 'user-01'
          },
          { 
            _id: 'card-id-28', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Email template system with customization', 
            description: 'Build dynamic email templates with drag-drop editor', 
            cover: null, 
            memberIds: ['user-02', 'user-04'], 
            comments: ['Template engine selected', 'Editor UI 60% complete'], 
            attachments: ['email-templates.html', 'editor-wireframe.png'],
            dueDate: '2025-01-02T16:45:00.000Z',  // New Year follow-up
            labelIds: ['label-02', 'label-05'], // Feature + Design
            createdAt: '2024-12-06T14:15:00.000Z',
            createdBy: 'user-02'
          },
          // ===== THÊM CARDS MỚI CHO THÁNG 5 & 6 năm 2025 =====
          { 
            _id: 'card-id-46', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Advanced AI-powered Content Recommendation Engine', 
            description: 'Develop machine learning algorithm for personalized content recommendations', 
            cover: null, 
            memberIds: ['user-06', 'user-08', 'user-01'], 
            comments: ['ML model training in progress', 'Data pipeline 85% complete'], 
            attachments: ['ml-model-specs.pdf', 'training-data-analysis.xlsx'],
            dueDate: '2025-05-08T15:00:00.000Z',  // May 8th afternoon
            labelIds: ['label-02', 'label-08'], // Feature + Research
            createdAt: '2025-04-22T10:30:00.000Z',
            createdBy: 'user-06'
          },
          { 
            _id: 'card-id-47', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Multi-language Internationalization (i18n) Implementation', 
            description: 'Implement comprehensive multi-language support for global expansion', 
            cover: null, 
            memberIds: ['user-03', 'user-07', 'user-05'], 
            comments: ['15 languages prioritized', 'Translation management system ready'], 
            attachments: ['i18n-strategy.pdf', 'language-priority-matrix.xlsx'],
            dueDate: '2025-05-18T12:30:00.000Z',  // May 18th midday
            labelIds: ['label-02', 'label-03'], // Feature + Enhancement
            createdAt: '2025-04-28T14:45:00.000Z',
            createdBy: 'user-03'
          },
          { 
            _id: 'card-id-48', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Advanced Analytics Dashboard v3.0 Development', 
            description: 'Build next-generation analytics dashboard with real-time insights and predictive analytics', 
            cover: null, 
            memberIds: ['user-05', 'user-01', 'user-04'], 
            comments: ['Real-time data streaming implemented', 'Predictive models integration 60%'], 
            attachments: ['dashboard-v3-wireframes.figma', 'analytics-requirements.md'],
            dueDate: '2025-06-10T16:45:00.000Z',  // June 10th afternoon
            labelIds: ['label-05', 'label-02'], // Design + Feature
            createdAt: '2025-05-05T11:20:00.000Z',
            createdBy: 'user-05'
          },
          { 
            _id: 'card-id-49', 
            boardId: 'board-id-01', 
            columnId: 'column-id-02', 
            title: 'Advanced Security & Fraud Detection System', 
            description: 'Implement sophisticated fraud detection using behavioral analysis and machine learning', 
            cover: null, 
            memberIds: ['user-08', 'user-02', 'user-06'], 
            comments: ['Behavioral patterns analysis complete', 'ML model accuracy 94%'], 
            attachments: ['fraud-detection-model.py', 'security-enhancement-plan.pdf'],
            dueDate: '2025-06-20T09:30:00.000Z',  // June 20th morning
            labelIds: ['label-06', 'label-08'], // Testing + Research
            createdAt: '2025-05-12T13:45:00.000Z',
            createdBy: 'user-08'
          }
        ]
      },
      {
        _id: 'column-id-03',
        boardId: 'board-id-01',
        title: 'Testing & Quality Assurance',
        cardOrderIds: ['card-id-11', 'card-id-12', 'card-id-13', 'card-id-17', 'card-id-29', 'card-id-30', 'card-id-31', 'card-id-32', 'card-id-50', 'card-id-51', 'card-id-52', 'card-id-53'],
        cards: [
          { 
            _id: 'card-id-11', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'Frontend responsive testing completion', 
            description: 'Comprehensive testing across multiple devices and browsers', 
            cover: null, 
            memberIds: ['user-03', 'user-05'], 
            comments: ['All major browsers tested', 'Mobile performance optimized'], 
            attachments: ['test-results.xlsx', 'browser-compatibility.pdf'],
            dueDate: '2024-12-16T18:00:00.000Z',  // Tomorrow evening
            labelIds: ['label-06', 'label-05'], // Testing + Design
            createdAt: '2024-12-09T09:00:00.000Z',
            createdBy: 'user-03'
          },
          { 
            _id: 'card-id-12', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'Database migration scripts validation', 
            description: 'Validate all migration scripts for production deployment', 
            cover: null, 
            memberIds: ['user-01', 'user-08'], 
            comments: ['Staging environment tested', 'Rollback procedures documented'], 
            attachments: ['migration-log.txt', 'rollback-plan.md'],
            dueDate: '2024-12-17T08:30:00.000Z',  // Tomorrow morning
            labelIds: ['label-06', 'label-07'], // Testing + Deployment
            createdAt: '2024-12-08T15:30:00.000Z',
            createdBy: 'user-01'
          },
          { 
            _id: 'card-id-13', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'Load testing with 10k concurrent users', 
            description: 'Stress test application performance under heavy load', 
            cover: null, 
            memberIds: ['user-08', 'user-02'], 
            comments: ['JMeter scenarios completed', 'Server scaling configured'], 
            attachments: ['load-test-report.pdf', 'performance-metrics.json'],
            dueDate: '2024-12-19T13:15:00.000Z',  // Thursday afternoon
            labelIds: ['label-06', 'label-03'], // Testing + Enhancement
            createdAt: '2024-12-07T10:20:00.000Z',
            createdBy: 'user-08'
          },
          { 
            _id: 'card-id-17', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'UI/UX accessibility audit completion', 
            description: 'WCAG 2.1 compliance testing and accessibility improvements', 
            cover: null, 
            memberIds: ['user-05', 'user-07'], 
            comments: ['Screen reader testing done', 'Color contrast improved'], 
            attachments: ['accessibility-report.pdf', 'wcag-checklist.xlsx'],
            dueDate: '2024-12-22T11:00:00.000Z',  // Sunday morning
            labelIds: ['label-05', 'label-06'], // Design + Testing
            createdAt: '2024-12-06T13:45:00.000Z',
            createdBy: 'user-05'
          },
          { 
            _id: 'card-id-29', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'API integration testing with mock services', 
            description: 'Test all external API integrations with comprehensive mock data', 
            cover: null, 
            memberIds: ['user-06', 'user-04'], 
            comments: ['Mock server setup complete', 'Edge cases identified'], 
            attachments: ['api-test-suite.json', 'mock-data-scenarios.md'],
            dueDate: '2024-12-20T14:45:00.000Z',  // Friday afternoon
            labelIds: ['label-06', 'label-02'], // Testing + Feature
            createdAt: '2024-12-05T12:30:00.000Z',
            createdBy: 'user-06'
          },
          { 
            _id: 'card-id-30', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'Security penetration testing results', 
            description: 'Review and address findings from external security audit', 
            cover: null, 
            memberIds: ['user-08', 'user-01'], 
            comments: ['High priority vulnerabilities fixed', 'Medium issues in progress'], 
            attachments: ['pentest-report.pdf', 'vulnerability-matrix.xlsx'],
            dueDate: '2024-12-24T09:30:00.000Z',  // Christmas Eve morning
            labelIds: ['label-06', 'label-01'], // Testing + Bug
            createdAt: '2024-12-04T16:20:00.000Z',
            createdBy: 'user-08'
          },
          { 
            _id: 'card-id-31', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'User acceptance testing coordination', 
            description: 'Coordinate UAT with key stakeholders and collect feedback', 
            cover: null, 
            memberIds: ['user-04', 'user-07'], 
            comments: ['Test scenarios prepared', 'User feedback sessions scheduled'], 
            attachments: ['uat-plan.pdf', 'feedback-template.docx'],
            dueDate: '2024-12-27T15:00:00.000Z',  // Friday after Christmas
            labelIds: ['label-09', 'label-10'], // Meeting + Review
            createdAt: '2024-12-03T10:45:00.000Z',
            createdBy: 'user-04'
          },
          { 
            _id: 'card-id-32', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'Automated testing pipeline optimization', 
            description: 'Improve CI/CD test execution speed and reliability', 
            cover: null, 
            memberIds: ['user-02', 'user-08'], 
            comments: ['Parallel test execution implemented', '50% speed improvement achieved'], 
            attachments: ['test-pipeline-config.yml', 'optimization-results.md'],
            dueDate: '2025-01-03T12:20:00.000Z',  // Early January
            labelIds: ['label-07', 'label-03'], // Deployment + Enhancement
            createdAt: '2024-12-02T14:10:00.000Z',
            createdBy: 'user-02'
          },
          // ===== THÊM CARDS MỚI CHO THÁNG 5 & 6 năm 2025 =====
          { 
            _id: 'card-id-50', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'Comprehensive Mobile App Testing on Latest iOS/Android', 
            description: 'Test mobile app compatibility on iOS 17, Android 14, and latest device models', 
            cover: null, 
            memberIds: ['user-05', 'user-03', 'user-07'], 
            comments: ['Device lab setup complete', '25+ device models testing'], 
            attachments: ['mobile-testing-matrix.xlsx', 'device-compatibility-report.pdf'],
            dueDate: '2025-05-15T14:30:00.000Z',  // May 15th afternoon
            labelIds: ['label-06', 'label-05'], // Testing + Design
            createdAt: '2025-04-30T09:15:00.000Z',
            createdBy: 'user-05'
          },
          { 
            _id: 'card-id-51', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'Summer Product Launch Beta Testing Program', 
            description: 'Coordinate beta testing program with 1000+ external testers for summer product launch', 
            cover: null, 
            memberIds: ['user-04', 'user-06', 'user-02'], 
            comments: ['Beta testers recruited', 'Feedback collection system ready'], 
            attachments: ['beta-testing-plan.pdf', 'tester-recruitment-strategy.md'],
            dueDate: '2025-05-25T11:00:00.000Z',  // May 25th morning
            labelIds: ['label-06', 'label-09'], // Testing + Meeting
            createdAt: '2025-05-08T13:20:00.000Z',
            createdBy: 'user-04'
          },
          { 
            _id: 'card-id-52', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'Mid-Year Security Audit & Compliance Testing', 
            description: 'Conduct comprehensive security audit for SOC 2 Type II compliance certification', 
            cover: null, 
            memberIds: ['user-08', 'user-01', 'user-03'], 
            comments: ['External auditor scheduled', 'Security controls documentation updated'], 
            attachments: ['security-audit-checklist.pdf', 'compliance-matrix.xlsx'],
            dueDate: '2025-06-05T10:00:00.000Z',  // June 5th morning
            labelIds: ['label-06', 'label-01'], // Testing + Bug
            createdAt: '2025-05-18T15:45:00.000Z',
            createdBy: 'user-08'
          },
          { 
            _id: 'card-id-53', 
            boardId: 'board-id-01', 
            columnId: 'column-id-03', 
            title: 'Advanced Performance Testing for Summer Traffic Spike', 
            description: 'Stress test infrastructure for expected 300% traffic increase during summer campaign', 
            cover: null, 
            memberIds: ['user-02', 'user-08', 'user-01'], 
            comments: ['Load testing scenarios prepared', 'Auto-scaling configuration tested'], 
            attachments: ['performance-test-plan.pdf', 'traffic-projection-analysis.xlsx'],
            dueDate: '2025-06-18T16:00:00.000Z',  // June 18th afternoon
            labelIds: ['label-06', 'label-03'], // Testing + Enhancement
            createdAt: '2025-05-28T12:30:00.000Z',
            createdBy: 'user-02'
          }
        ]
      },
      {
        _id: 'column-id-04',
        boardId: 'board-id-01',
        title: 'Deployment & Production Ready',
        cardOrderIds: ['card-id-33', 'card-id-34', 'card-id-35', 'card-id-36', 'card-id-37', 'card-id-54', 'card-id-55', 'card-id-56', 'card-id-57'],
        cards: [
          {
            _id: 'card-id-33',
            boardId: 'board-id-01',
            columnId: 'column-id-04',
            title: 'Production deployment preparation',
            description: 'Final checklist and deployment strategy for production release',
            cover: null,
            memberIds: ['user-02', 'user-08'],
            comments: ['Infrastructure ready', 'SSL certificates configured'],
            attachments: ['deployment-checklist.pdf', 'production-config.env'],
            dueDate: '2024-12-31T23:59:00.000Z',  // New Year's Eve
            labelIds: ['label-07', 'label-09'], // Deployment + Meeting
            createdAt: '2024-12-01T09:30:00.000Z',
            createdBy: 'user-02'
          },
          {
            _id: 'card-id-34',
            boardId: 'board-id-01',
            columnId: 'column-id-04',
            title: 'Customer onboarding documentation',
            description: 'Complete user guides and training materials for new customers',
            cover: null,
            memberIds: ['user-04', 'user-07'],
            comments: ['Video tutorials completed', 'FAQ section expanded'],
            attachments: ['user-manual.pdf', 'onboarding-videos.zip'],
            dueDate: '2025-01-05T12:00:00.000Z',  // Early January
            labelIds: ['label-04', 'label-10'], // Documentation + Review
            createdAt: '2024-11-30T14:20:00.000Z',
            createdBy: 'user-04'
          },
          {
            _id: 'card-id-35',
            boardId: 'board-id-01',
            columnId: 'column-id-04',
            title: 'Marketing website launch coordination',
            description: 'Coordinate with marketing team for product launch and website updates',
            cover: null,
            memberIds: ['user-05', 'user-06'],
            comments: ['Landing page designs approved', 'SEO optimization complete'],
            attachments: ['marketing-assets.zip', 'seo-report.pdf'],
            dueDate: '2025-01-10T16:00:00.000Z',  // Mid January
            labelIds: ['label-09', 'label-05'], // Meeting + Design
            createdAt: '2024-11-29T11:15:00.000Z',
            createdBy: 'user-05'
          },
          {
            _id: 'card-id-36',
            boardId: 'board-id-01',
            columnId: 'column-id-04',
            title: 'Post-launch monitoring and analytics setup',
            description: 'Configure comprehensive monitoring for production environment',
            cover: null,
            memberIds: ['user-01', 'user-08'],
            comments: ['Grafana dashboards created', 'Alert thresholds configured'],
            attachments: ['monitoring-setup.md', 'dashboard-config.json'],
            dueDate: '2025-01-08T10:30:00.000Z',  // Early January
            labelIds: ['label-07', 'label-03'], // Deployment + Enhancement
            createdAt: '2024-11-28T16:45:00.000Z',
            createdBy: 'user-01'
          },
          {
            _id: 'card-id-37',
            boardId: 'board-id-01',
            columnId: 'column-id-04',
            title: 'Quarterly business review preparation',
            description: 'Prepare comprehensive report for Q4 achievements and Q1 planning',
            cover: null,
            memberIds: ['user-03', 'user-06'],
            comments: ['Metrics collected', 'Executive summary drafted'],
            attachments: ['q4-report.pptx', 'metrics-dashboard.xlsx'],
            dueDate: '2025-01-15T14:00:00.000Z',  // Mid January
            labelIds: ['label-09', 'label-10'], // Meeting + Review
            createdAt: '2024-11-27T13:20:00.000Z',
            createdBy: 'user-03'
          },
          // ===== THÊM CARDS MỚI CHO THÁNG 5 & 6 năm 2025 =====
          {
            _id: 'card-id-54',
            boardId: 'board-id-01',
            columnId: 'column-id-04',
            title: 'Summer Mobile App v2.0 Production Release',
            description: 'Final production deployment of mobile app v2.0 with enhanced features',
            cover: null,
            memberIds: ['user-05', 'user-02', 'user-08'],
            comments: ['App Store review approved', 'Play Store certification complete'],
            attachments: ['mobile-release-notes-v2.0.md', 'store-listing-assets.zip'],
            dueDate: '2025-05-30T12:00:00.000Z',  // May 30th noon
            labelIds: ['label-07', 'label-02'], // Deployment + Feature
            createdAt: '2025-05-20T14:30:00.000Z',
            createdBy: 'user-05'
          },
          {
            _id: 'card-id-55',
            boardId: 'board-id-01',
            columnId: 'column-id-04',
            title: 'Global Multi-language Platform Launch',
            description: 'Deploy internationalized platform supporting 15 languages for global markets',
            cover: null,
            memberIds: ['user-03', 'user-07', 'user-01'],
            comments: ['CDN configuration optimized', 'Regional servers deployed'],
            attachments: ['global-deployment-strategy.pdf', 'language-testing-report.xlsx'],
            dueDate: '2025-06-08T15:30:00.000Z',  // June 8th afternoon
            labelIds: ['label-07', 'label-09'], // Deployment + Meeting
            createdAt: '2025-05-25T10:45:00.000Z',
            createdBy: 'user-03'
          },
          {
            _id: 'card-id-56',
            boardId: 'board-id-01',
            columnId: 'column-id-04',
            title: 'Summer Campaign Infrastructure Scaling Deployment',
            description: 'Deploy auto-scaling infrastructure to handle 300% traffic increase during summer campaign',
            cover: null,
            memberIds: ['user-08', 'user-02', 'user-01'],
            comments: ['Load balancers configured', 'Database sharding implemented'],
            attachments: ['scaling-architecture.png', 'infrastructure-capacity-plan.xlsx'],
            dueDate: '2025-06-22T09:00:00.000Z',  // June 22nd morning
            labelIds: ['label-07', 'label-03'], // Deployment + Enhancement
            createdAt: '2025-06-05T13:15:00.000Z',
            createdBy: 'user-08'
          },
          {
            _id: 'card-id-57',
            boardId: 'board-id-01',
            columnId: 'column-id-04',
            title: 'Mid-Year Customer Success & Training Program Launch',
            description: 'Launch comprehensive customer success program with training materials and support resources',
            cover: null,
            memberIds: ['user-04', 'user-06', 'user-07'],
            comments: ['Training portal deployed', 'Support team scaling complete'],
            attachments: ['customer-success-program.pdf', 'training-curriculum.docx'],
            dueDate: '2025-06-28T14:00:00.000Z',  // June 28th afternoon
            labelIds: ['label-04', 'label-09'], // Documentation + Meeting
            createdAt: '2025-06-10T11:20:00.000Z',
            createdBy: 'user-04'
          }
        ]
      }
    ],

    FE_allUsers: [
      { _id: 'user-01', displayName: 'Nguyen Van Hoa', avatar: 'avatar1.jpg' },
      { _id: 'user-02', displayName: 'Tran Minh Hung', avatar: 'avatar2.jpg' },
      { _id: 'user-03', displayName: 'Le Quang Huy', avatar: 'avatar3.jpg' },
      { _id: 'user-04', displayName: 'Pham Minh Duc', avatar: 'avatar4.jpg' },
      { _id: 'user-05', displayName: 'Vo Thi Mai', avatar: 'avatar5.jpg' },
      { _id: 'user-06', displayName: 'Nguyen Thai Son', avatar: 'avatar6.jpg' },
      { _id: 'user-07', displayName: 'Hoang Yen Nhi', avatar: 'avatar7.jpg' },
      { _id: 'user-08', displayName: 'Dang Minh Quan', avatar: 'avatar8.jpg' }
    ]
  }
}
