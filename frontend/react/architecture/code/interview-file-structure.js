/**
 * File: interview-file-structure.js
 * Description: Interview question - Design scalable file structure for large React application
 * Tests architectural thinking, organization skills, and scalability considerations
 */

// === INTERVIEW QUESTION ===
// Design a file structure for a large React application with the following requirements:
// 1. Multi-tenant SaaS platform (different clients/organizations)
// 2. Multiple user roles (admin, manager, employee, customer)
// 3. Various modules (authentication, dashboard, reporting, settings, billing)
// 4. Shared components and utilities
// 5. Multiple environments (dev, staging, production)
// 6. Internationalization support
// 7. Theme customization
// 8. Plugin/widget system
// 9. Mobile and desktop views
// 10. Micro-frontend architecture support

// === PROPOSED FILE STRUCTURE ===

/*
Project Root Structure:

saas-platform/
├── README.md
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── webpack.config.js
├── tsconfig.json
├── 
├── docs/                           # Documentation
│   ├── README.md
│   ├── api/                        # API documentation
│   ├── components/                 # Component documentation
│   ├── architecture/               # Architecture decisions
│   └── deployment/                 # Deployment guides
├── 
├── public/                         # Static assets
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   ├── locales/                    # Translation files
│   │   ├── en/
│   │   ├── es/
│   │   ├── fr/
│   │   └── de/
│   └── assets/                     # Static assets
│       ├── images/
│       ├── icons/
│       └── fonts/
├── 
├── src/                            # Source code
│   ├── index.tsx                   # Application entry point
│   ├── App.tsx                     # Root App component
│   ├── 
│   ├── config/                     # Configuration files
│   │   ├── index.ts                # Main config exports
│   │   ├── environment.ts          # Environment-specific config
│   │   ├── api.ts                  # API configuration
│   │   ├── theme.ts                # Theme configuration
│   │   ├── routes.ts               # Route definitions
│   │   └── constants.ts            # Application constants
│   │   
│   ├── types/                      # TypeScript type definitions
│   │   ├── index.ts                # Main type exports
│   │   ├── api.ts                  # API types
│   │   ├── user.ts                 # User-related types
│   │   ├── organization.ts         # Organization types
│   │   ├── billing.ts              # Billing types
│   │   └── common.ts               # Common/utility types
│   │   
│   ├── utils/                      # Utility functions
│   │   ├── index.ts                # Main utility exports
│   │   ├── api/                    # API utilities
│   │   │   ├── client.ts           # HTTP client
│   │   │   ├── endpoints.ts        # API endpoints
│   │   │   ├── interceptors.ts     # Request/response interceptors
│   │   │   └── cache.ts            # API caching utilities
│   │   ├── auth/                   # Authentication utilities
│   │   │   ├── token.ts            # Token management
│   │   │   ├── permissions.ts      # Permission checking
│   │   │   └── storage.ts          # Auth storage utilities
│   │   ├── validation/             # Validation utilities
│   │   │   ├── schemas.ts          # Validation schemas
│   │   │   ├── rules.ts            # Custom validation rules
│   │   │   └── formatters.ts       # Data formatters
│   │   ├── date.ts                 # Date utilities
│   │   ├── string.ts               # String utilities
│   │   ├── number.ts               # Number utilities
│   │   ├── storage.ts              # Local/session storage
│   │   ├── logger.ts               # Logging utilities
│   │   └── performance.ts          # Performance utilities
│   │   
│   ├── hooks/                      # Custom React hooks
│   │   ├── index.ts                # Main hook exports
│   │   ├── api/                    # API-related hooks
│   │   │   ├── useApi.ts           # Generic API hook
│   │   │   ├── useQuery.ts         # Query hook
│   │   │   ├── useMutation.ts      # Mutation hook
│   │   │   └── useCache.ts         # Caching hook
│   │   ├── auth/                   # Authentication hooks
│   │   │   ├── useAuth.ts          # Auth state hook
│   │   │   ├── usePermissions.ts   # Permission hooks
│   │   │   └── useRole.ts          # Role-based hooks
│   │   ├── ui/                     # UI-related hooks
│   │   │   ├── useTheme.ts         # Theme hooks
│   │   │   ├── useModal.ts         # Modal management
│   │   │   ├── useToast.ts         # Toast notifications
│   │   │   └── useBreakpoint.ts    # Responsive breakpoints
│   │   ├── storage/                # Storage hooks
│   │   │   ├── useLocalStorage.ts  # Local storage hook
│   │   │   ├── useSessionStorage.ts # Session storage hook
│   │   │   └── useDatabase.ts      # Database hooks
│   │   └── form/                   # Form-related hooks
│   │       ├── useForm.ts          # Form management
│   │       ├── useValidation.ts    # Validation hooks
│   │       └── useFormPersistence.ts # Form persistence
│   │       
│   ├── contexts/                   # React contexts
│   │   ├── index.ts                # Context exports
│   │   ├── AuthContext.tsx         # Authentication context
│   │   ├── ThemeContext.tsx        # Theme context
│   │   ├── OrganizationContext.tsx # Organization context
│   │   ├── NotificationContext.tsx # Notification context
│   │   ├── ModalContext.tsx        # Modal context
│   │   └── PluginContext.tsx       # Plugin context
│   │   
│   ├── store/                      # State management (Redux/Zustand)
│   │   ├── index.ts                # Store configuration
│   │   ├── middleware.ts           # Custom middleware
│   │   ├── slices/                 # Redux slices or Zustand stores
│   │   │   ├── authSlice.ts        # Authentication state
│   │   │   ├── userSlice.ts        # User state
│   │   │   ├── organizationSlice.ts # Organization state
│   │   │   ├── uiSlice.ts          # UI state
│   │   │   └── cacheSlice.ts       # Cache state
│   │   ├── selectors/              # Reselect selectors
│   │   │   ├── authSelectors.ts    # Auth selectors
│   │   │   ├── userSelectors.ts    # User selectors
│   │   │   └── uiSelectors.ts      # UI selectors
│   │   └── sagas/                  # Redux-saga (if used)
│   │       ├── authSagas.ts        # Auth sagas
│   │       ├── apiSagas.ts         # API sagas
│   │       └── rootSaga.ts         # Root saga
│   │       
│   ├── services/                   # Business logic services
│   │   ├── index.ts                # Service exports
│   │   ├── api/                    # API services
│   │   │   ├── authService.ts      # Authentication API
│   │   │   ├── userService.ts      # User management API
│   │   │   ├── organizationService.ts # Organization API
│   │   │   ├── billingService.ts   # Billing API
│   │   │   └── reportingService.ts # Reporting API
│   │   ├── auth/                   # Authentication services
│   │   │   ├── authProvider.ts     # Auth provider service
│   │   │   ├── tokenService.ts     # Token management
│   │   │   └── permissionService.ts # Permission service
│   │   ├── notification/           # Notification services
│   │   │   ├── emailService.ts     # Email notifications
│   │   │   ├── pushService.ts      # Push notifications
│   │   │   └── smsService.ts       # SMS notifications
│   │   ├── analytics/              # Analytics services
│   │   │   ├── trackingService.ts  # Event tracking
│   │   │   ├── metricsService.ts   # Metrics collection
│   │   │   └── reportingService.ts # Report generation
│   │   └── file/                   # File handling services
│   │       ├── uploadService.ts    # File upload
│   │       ├── downloadService.ts  # File download
│   │       └── storageService.ts   # File storage
│   │       
│   ├── components/                 # Reusable components
│   │   ├── index.ts                # Component exports
│   │   ├── 
│   │   ├── ui/                     # Basic UI components (Atomic Design - Atoms)
│   │   │   ├── Button/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.stories.tsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Checkbox/
│   │   │   ├── Radio/
│   │   │   ├── TextArea/
│   │   │   ├── Label/
│   │   │   ├── Icon/
│   │   │   ├── Avatar/
│   │   │   ├── Badge/
│   │   │   ├── Spinner/
│   │   │   └── Divider/
│   │   │   
│   │   ├── form/                   # Form components (Atomic Design - Molecules)
│   │   │   ├── FormField/
│   │   │   ├── FormGroup/
│   │   │   ├── SearchBox/
│   │   │   ├── DatePicker/
│   │   │   ├── FileUpload/
│   │   │   ├── RichTextEditor/
│   │   │   └── FormValidation/
│   │   │   
│   │   ├── layout/                 # Layout components
│   │   │   ├── Container/
│   │   │   ├── Grid/
│   │   │   ├── Flex/
│   │   │   ├── Stack/
│   │   │   ├── Spacer/
│   │   │   └── Responsive/
│   │   │   
│   │   ├── navigation/             # Navigation components
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Breadcrumb/
│   │   │   ├── Pagination/
│   │   │   ├── Menu/
│   │   │   ├── Tabs/
│   │   │   └── Steps/
│   │   │   
│   │   ├── feedback/               # Feedback components
│   │   │   ├── Toast/
│   │   │   ├── Modal/
│   │   │   ├── Alert/
│   │   │   ├── ConfirmDialog/
│   │   │   ├── Tooltip/
│   │   │   ├── Progress/
│   │   │   └── Skeleton/
│   │   │   
│   │   ├── data-display/           # Data display components
│   │   │   ├── Table/
│   │   │   ├── List/
│   │   │   ├── Card/
│   │   │   ├── Timeline/
│   │   │   ├── Chart/
│   │   │   ├── Graph/
│   │   │   ├── Calendar/
│   │   │   └── Gallery/
│   │   │   
│   │   ├── media/                  # Media components
│   │   │   ├── Image/
│   │   │   ├── Video/
│   │   │   ├── Audio/
│   │   │   └── Document/
│   │   │   
│   │   └── utility/                # Utility components
│   │       ├── ErrorBoundary/
│   │       ├── LazyLoad/
│   │       ├── Portal/
│   │       ├── Observer/
│   │       ├── ClickOutside/
│   │       └── FocusTrap/
│   │       
│   ├── features/                   # Feature-based organization (Atomic Design - Organisms/Templates)
│   │   ├── 
│   │   ├── auth/                   # Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── LoginForm/
│   │   │   │   ├── SignupForm/
│   │   │   │   ├── ForgotPasswordForm/
│   │   │   │   ├── ResetPasswordForm/
│   │   │   │   ├── TwoFactorAuth/
│   │   │   │   └── SocialLogin/
│   │   │   ├── hooks/
│   │   │   │   ├── useLogin.ts
│   │   │   │   ├── useSignup.ts
│   │   │   │   └── usePasswordReset.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── types/
│   │   │   │   └── auth.ts
│   │   │   └── utils/
│   │   │       └── validation.ts
│   │   │       
│   │   ├── dashboard/              # Dashboard feature
│   │   │   ├── components/
│   │   │   │   ├── DashboardLayout/
│   │   │   │   ├── WidgetGrid/
│   │   │   │   ├── MetricCard/
│   │   │   │   ├── ChartWidget/
│   │   │   │   ├── TableWidget/
│   │   │   │   └── CustomWidget/
│   │   │   ├── widgets/            # Plugin widgets
│   │   │   │   ├── SalesWidget/
│   │   │   │   ├── AnalyticsWidget/
│   │   │   │   ├── TaskWidget/
│   │   │   │   └── NewsWidget/
│   │   │   ├── hooks/
│   │   │   │   ├── useDashboard.ts
│   │   │   │   ├── useWidgets.ts
│   │   │   │   └── useMetrics.ts
│   │   │   └── services/
│   │   │       └── dashboardService.ts
│   │   │       
│   │   ├── user-management/        # User management feature
│   │   │   ├── components/
│   │   │   │   ├── UserList/
│   │   │   │   ├── UserProfile/
│   │   │   │   ├── UserForm/
│   │   │   │   ├── RoleSelector/
│   │   │   │   └── PermissionMatrix/
│   │   │   ├── hooks/
│   │   │   │   ├── useUsers.ts
│   │   │   │   ├── useRoles.ts
│   │   │   │   └── usePermissions.ts
│   │   │   └── services/
│   │   │       └── userService.ts
│   │   │       
│   │   ├── organization/           # Organization management
│   │   │   ├── components/
│   │   │   │   ├── OrganizationSettings/
│   │   │   │   ├── OrganizationProfile/
│   │   │   │   ├── TeamManagement/
│   │   │   │   └── BrandingSettings/
│   │   │   ├── hooks/
│   │   │   │   └── useOrganization.ts
│   │   │   └── services/
│   │   │       └── organizationService.ts
│   │   │       
│   │   ├── billing/                # Billing and subscriptions
│   │   │   ├── components/
│   │   │   │   ├── BillingDashboard/
│   │   │   │   ├── SubscriptionPlan/
│   │   │   │   ├── PaymentMethod/
│   │   │   │   ├── Invoice/
│   │   │   │   └── UsageMetrics/
│   │   │   ├── hooks/
│   │   │   │   ├── useBilling.ts
│   │   │   │   └── useSubscription.ts
│   │   │   └── services/
│   │   │       └── billingService.ts
│   │   │       
│   │   ├── reporting/              # Reporting and analytics
│   │   │   ├── components/
│   │   │   │   ├── ReportBuilder/
│   │   │   │   ├── ReportViewer/
│   │   │   │   ├── ChartBuilder/
│   │   │   │   └── ExportTools/
│   │   │   ├── hooks/
│   │   │   │   ├── useReports.ts
│   │   │   │   └── useAnalytics.ts
│   │   │   └── services/
│   │   │       └── reportingService.ts
│   │   │       
│   │   ├── settings/               # Application settings
│   │   │   ├── components/
│   │   │   │   ├── GeneralSettings/
│   │   │   │   ├── SecuritySettings/
│   │   │   │   ├── NotificationSettings/
│   │   │   │   ├── IntegrationSettings/
│   │   │   │   └── ThemeSettings/
│   │   │   ├── hooks/
│   │   │   │   └── useSettings.ts
│   │   │   └── services/
│   │   │       └── settingsService.ts
│   │   │       
│   │   └── plugins/                # Plugin system
│   │       ├── core/
│   │       │   ├── PluginManager/
│   │       │   ├── PluginLoader/
│   │       │   └── PluginRegistry/
│   │       ├── types/
│   │       │   └── plugin.ts
│   │       └── examples/
│   │           ├── SamplePlugin/
│   │           └── CustomWidget/
│   │           
│   ├── pages/                      # Page components (Atomic Design - Pages)
│   │   ├── index.ts                # Page exports
│   │   ├── 
│   │   ├── public/                 # Public pages (no auth required)
│   │   │   ├── HomePage/
│   │   │   ├── AboutPage/
│   │   │   ├── ContactPage/
│   │   │   ├── PricingPage/
│   │   │   ├── LoginPage/
│   │   │   ├── SignupPage/
│   │   │   └── ForgotPasswordPage/
│   │   │   
│   │   ├── dashboard/              # Dashboard pages
│   │   │   ├── DashboardPage/
│   │   │   ├── OverviewPage/
│   │   │   ├── AnalyticsPage/
│   │   │   └── ReportsPage/
│   │   │   
│   │   ├── users/                  # User management pages
│   │   │   ├── UsersPage/
│   │   │   ├── UserDetailsPage/
│   │   │   ├── RolesPage/
│   │   │   └── PermissionsPage/
│   │   │   
│   │   ├── organization/           # Organization pages
│   │   │   ├── OrganizationPage/
│   │   │   ├── TeamPage/
│   │   │   └── SettingsPage/
│   │   │   
│   │   ├── billing/                # Billing pages
│   │   │   ├── BillingPage/
│   │   │   ├── SubscriptionPage/
│   │   │   ├── InvoicesPage/
│   │   │   └── PaymentPage/
│   │   │   
│   │   ├── settings/               # Settings pages
│   │   │   ├── SettingsPage/
│   │   │   ├── ProfilePage/
│   │   │   ├── SecurityPage/
│   │   │   └── IntegrationsPage/
│   │   │   
│   │   └── error/                  # Error pages
│   │       ├── NotFoundPage/
│   │       ├── ForbiddenPage/
│   │       ├── ServerErrorPage/
│   │       └── MaintenancePage/
│   │       
│   ├── layouts/                    # Layout components
│   │   ├── index.ts                # Layout exports
│   │   ├── AppLayout/              # Main application layout
│   │   ├── AuthLayout/             # Authentication layout
│   │   ├── DashboardLayout/        # Dashboard layout
│   │   ├── PublicLayout/           # Public pages layout
│   │   ├── PrintLayout/            # Print-specific layout
│   │   └── ErrorLayout/            # Error pages layout
│   │   
│   ├── routing/                    # Routing configuration
│   │   ├── index.ts                # Router exports
│   │   ├── AppRouter.tsx           # Main router component
│   │   ├── routes/                 # Route definitions
│   │   │   ├── publicRoutes.ts     # Public routes
│   │   │   ├── privateRoutes.ts    # Private routes
│   │   │   ├── adminRoutes.ts      # Admin routes
│   │   │   └── errorRoutes.ts      # Error routes
│   │   ├── guards/                 # Route guards
│   │   │   ├── AuthGuard.tsx       # Authentication guard
│   │   │   ├── RoleGuard.tsx       # Role-based guard
│   │   │   └── PermissionGuard.tsx # Permission guard
│   │   └── utils/                  # Routing utilities
│   │       ├── navigation.ts       # Navigation helpers
│   │       └── permissions.ts      # Permission utilities
│   │       
│   ├── styles/                     # Global styles and themes
│   │   ├── index.css               # Main styles entry
│   │   ├── globals.css             # Global styles
│   │   ├── variables.css           # CSS variables
│   │   ├── reset.css               # CSS reset
│   │   ├── 
│   │   ├── themes/                 # Theme definitions
│   │   │   ├── light.css           # Light theme
│   │   │   ├── dark.css            # Dark theme
│   │   │   ├── high-contrast.css   # High contrast theme
│   │   │   └── custom.css          # Custom theme template
│   │   │   
│   │   ├── components/             # Component-specific styles
│   │   │   ├── button.css
│   │   │   ├── form.css
│   │   │   └── layout.css
│   │   │   
│   │   ├── utilities/              # Utility classes
│   │   │   ├── spacing.css         # Margin/padding utilities
│   │   │   ├── typography.css      # Text utilities
│   │   │   ├── colors.css          # Color utilities
│   │   │   └── responsive.css      # Responsive utilities
│   │   │   
│   │   └── vendor/                 # Third-party styles
│   │       ├── normalize.css
│   │       └── third-party.css
│   │       
│   ├── i18n/                       # Internationalization
│   │   ├── index.ts                # i18n configuration
│   │   ├── resources/              # Translation resources
│   │   │   ├── en/
│   │   │   │   ├── common.json     # Common translations
│   │   │   │   ├── auth.json       # Auth translations
│   │   │   │   ├── dashboard.json  # Dashboard translations
│   │   │   │   └── errors.json     # Error translations
│   │   │   ├── es/
│   │   │   ├── fr/
│   │   │   └── de/
│   │   ├── hooks/                  # i18n hooks
│   │   │   ├── useTranslation.ts   # Translation hook
│   │   │   └── useLanguage.ts      # Language switching
│   │   └── utils/                  # i18n utilities
│   │       ├── formatters.ts       # Date/number formatters
│   │       └── detection.ts        # Language detection
│   │       
│   ├── assets/                     # Asset imports
│   │   ├── images/                 # Image assets
│   │   │   ├── logos/
│   │   │   ├── icons/
│   │   │   ├── illustrations/
│   │   │   └── backgrounds/
│   │   ├── fonts/                  # Font files
│   │   ├── videos/                 # Video assets
│   │   └── sounds/                 # Audio assets
│   │   
│   └── tests/                      # Test utilities and setup
│       ├── setup.ts                # Test setup
│       ├── utils/                  # Test utilities
│       │   ├── render.tsx          # Custom render function
│       │   ├── mocks.ts            # Mock utilities
│       │   ├── factories.ts        # Test data factories
│       │   └── matchers.ts         # Custom matchers
│       ├── mocks/                  # Mock implementations
│       │   ├── api.ts              # API mocks
│       │   ├── localStorage.ts     # Storage mocks
│       │   ├── router.ts           # Router mocks
│       │   └── services.ts         # Service mocks
│       ├── fixtures/               # Test data fixtures
│       │   ├── users.json          # User test data
│       │   ├── organizations.json  # Organization test data
│       │   └── responses.json      # API response fixtures
│       └── __snapshots__/          # Jest snapshots
├── 
├── scripts/                        # Build and utility scripts
│   ├── build.js                    # Custom build script
│   ├── deploy.js                   # Deployment script
│   ├── analyze.js                  # Bundle analysis
│   ├── i18n-extract.js             # Translation extraction
│   └── component-generator.js      # Component generator
├── 
├── .github/                        # GitHub-specific files
│   ├── workflows/                  # GitHub Actions
│   │   ├── ci.yml                  # Continuous integration
│   │   ├── cd.yml                  # Continuous deployment
│   │   └── pr-checks.yml           # PR checks
│   ├── ISSUE_TEMPLATE/             # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md    # PR template
├── 
├── environments/                   # Environment configurations
│   ├── .env.development           # Development environment
│   ├── .env.staging               # Staging environment
│   ├── .env.production            # Production environment
│   └── .env.test                  # Test environment
├── 
└── tools/                         # Development tools
    ├── webpack/                   # Webpack configurations
    │   ├── webpack.common.js      # Common webpack config
    │   ├── webpack.dev.js         # Development config
    │   ├── webpack.prod.js        # Production config
    │   └── webpack.analyze.js     # Bundle analysis config
    ├── storybook/                 # Storybook configuration
    │   ├── main.js                # Storybook main config
    │   ├── preview.js             # Storybook preview
    │   └── addons.js              # Storybook addons
    ├── eslint/                    # ESLint configurations
    │   ├── .eslintrc.base.js      # Base ESLint config
    │   ├── .eslintrc.react.js     # React-specific rules
    │   └── .eslintrc.typescript.js # TypeScript rules
    └── generators/                # Code generators
        ├── component/             # Component generator
        ├── feature/               # Feature generator
        ├── page/                  # Page generator
        └── service/               # Service generator
*/

// === KEY ARCHITECTURAL DECISIONS ===

/**
 * 1. FEATURE-BASED STRUCTURE
 * - Features are self-contained with their own components, hooks, services
 * - Reduces coupling and improves maintainability
 * - Supports micro-frontend architecture
 */

/**
 * 2. ATOMIC DESIGN PRINCIPLES
 * - UI components organized by complexity (atoms → molecules → organisms)
 * - Promotes reusability and consistency
 * - Clear component hierarchy and dependencies
 */

/**
 * 3. SEPARATION OF CONCERNS
 * - Business logic in services layer
 * - UI logic in components and hooks
 * - State management isolated in store
 * - Configuration centralized in config
 */

/**
 * 4. SCALABILITY CONSIDERATIONS
 * - Clear module boundaries
 * - Plugin architecture support
 * - Micro-frontend ready structure
 * - Environment-specific configurations
 */

/**
 * 5. DEVELOPER EXPERIENCE
 * - Consistent naming conventions
 * - Co-located tests and stories
 * - Comprehensive tooling setup
 * - Code generation templates
 */

export const fileStructureRationale = {
  principles: [
    'Feature-based organization for better maintainability',
    'Atomic Design for component consistency',
    'Clear separation of concerns',
    'Scalability-first approach',
    'Developer experience optimization'
  ],
  
  benefits: [
    'Easy to navigate and understand',
    'Supports team collaboration',
    'Enables micro-frontend architecture',
    'Facilitates code reuse',
    'Improves testing and deployment'
  ],
  
  tradeoffs: [
    'Initial complexity for small projects',
    'More files and folders to maintain',
    'Learning curve for new developers',
    'Potential over-engineering for simple features'
  ]
};

// === COMPONENT EXAMPLE STRUCTURE ===

/*
Example: Button Component Structure

components/ui/Button/
├── index.ts                    # Main export
├── Button.tsx                  # Component implementation
├── Button.test.tsx            # Unit tests
├── Button.stories.tsx         # Storybook stories
├── Button.module.css          # Component styles
├── Button.types.ts            # Component types
├── variants/                  # Button variants
│   ├── PrimaryButton.tsx
│   ├── SecondaryButton.tsx
│   └── IconButton.tsx
└── hooks/                     # Component-specific hooks
    └── useButtonState.ts
*/

// === FEATURE EXAMPLE STRUCTURE ===

/*
Example: Authentication Feature Structure

features/auth/
├── index.ts                   # Feature exports
├── components/                # Feature components
│   ├── LoginForm/
│   ├── SignupForm/
│   └── PasswordReset/
├── hooks/                     # Feature hooks
│   ├── useAuth.ts
│   ├── useLogin.ts
│   └── usePasswordReset.ts
├── services/                  # Feature services
│   ├── authService.ts
│   ├── tokenService.ts
│   └── validationService.ts
├── store/                     # Feature state
│   ├── authSlice.ts
│   └── authSelectors.ts
├── types/                     # Feature types
│   └── auth.types.ts
├── utils/                     # Feature utilities
│   └── validation.ts
└── constants/                 # Feature constants
    └── auth.constants.ts
*/

export default {
  fileStructureRationale,
  // Additional architectural documentation would go here
};