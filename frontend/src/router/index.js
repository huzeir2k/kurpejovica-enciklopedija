/**
 * Vue Router Configuration
 * 
 * Defines all application routes with lazy loading and access control
 * Implements role-based route protection via meta guards
 * 
 * ROUTE STRUCTURE:
 * 
 * Public Routes (no authentication required):
 * - / (Home): Landing page with featured family members and articles
 * - /login: User authentication form
 * - /member/:id: View family member profile (public profile)
 * - /search: Family member search interface
 * - /articles: List all general articles
 * - /articles/:id: View specific article
 * 
 * Protected Routes (authentication required):
 * - /member/:id/edit: Edit family member profile (requiresEdit permission)
 * - /family: Family management dashboard (requiresEdit permission)
 * - /admin: Admin dashboard (requiresAdmin role)
 * - /admin/articles: Manage articles (requiresAdmin role)
 * 
 * ACCESS CONTROL:
 * 
 * Meta properties on routes:
 * - requiresAuth: User must be logged in
 * - requiresEdit: User must have editor/admin role (canEdit permission)
 * - requiresAdmin: User must have admin role
 * 
 * Router guards (beforeEach hook):
 * - Checks meta requirements on route transition
 * - Redirects unauthorized users to login or home
 * - Prevents direct URL access to protected pages
 * 
 * PERFORMANCE:
 * 
 * Lazy loading: All components loaded dynamically with import()
 * - Routes only loaded when first visited
 * - Reduces initial bundle size
 * - Each route is a separate JavaScript chunk
 * 
 * Typical lazy-loaded component (10KB-30KB each):
 * HomePage, FamilyMemberPage, EditMemberPage, FamilyManagementPage,
 * AdminPage, SearchPage, ArticlesListPage, ArticlePage, AdminArticlePage
 * 
 * @module router
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * ROUTE CONFIGURATION ARRAY
 * 
 * Defines all available routes in the application
 * Each route object includes:
 * - path: URL pattern
 * - name: Route name for router.push() and navigation
 * - component: Lazy-loaded Vue component
 * - meta: Optional configuration (requiresAuth, requiresAdmin, etc.)
 * 
 * PATH PARAMETERS:
 * - :id - Dynamic segment for specific resource ID
 *   Used in: /member/:id, /articles/:id
 * 
 * LAZY LOADING:
 * - All components imported with import() for code splitting
 * - Bundler (Vite) automatically creates separate chunk per route
 * - Components loaded on-demand, not at app startup
 * - Reduces initial page load time significantly
 */
const routes = [
  /**
   * PUBLIC ROUTES
   * No authentication required
   */

  /**
   * Home Page
   * 
   * Path: /
   * Displays:
   * - 6 random family members (featured)
   * - 3 random articles (featured)
   * - Navigation to search and articles pages
   * - Language selector with auto-detection info
   * 
   * Access: Everyone
   */
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomePage.vue'),
  },

  /**
   * Login Page
   * 
   * Path: /login
   * Features:
   * - Email/password login form
   * - Register link
   * - Error message display
   * - Token storage and redirect on success
   * 
   * Access: Everyone (unauthenticated users redirected here)
   * Redirect after login: Based on intended destination or home
   */
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
  },

  /**
   * Family Member Public Profile
   * 
   * Path: /member/:id
   * Example: /member/42 or /member/kurpejovic-milos
   * 
   * Displays:
   * - Family member biography and details
   * - Wikipedia-style layout with sidebar
   * - Related family members (See Also section)
   * - Family tree relationships
   * - Translated content in selected language
   * 
   * Access: Everyone (public profile)
   */
  {
    path: '/member/:id',
    name: 'FamilyMember',
    component: () => import('@/pages/FamilyMemberPage.vue'),
  },

  /**
   * Edit Family Member Profile
   * 
   * Path: /member/:id/edit
   * Example: /member/42/edit
   * 
   * Features:
   * - Edit form for family member details
   * - Update biography, dates, images
   * - Add/remove relationships
   * - Form validation
   * 
   * Access: Protected
   * Requirements: requiresAuth + requiresEdit permissions
   * - Users with canEdit role (editors, admins)
   * - Own profile edit enabled for some users
   * 
   * Unauthorized redirect: → /
   */
  {
    path: '/member/:id/edit',
    name: 'EditMember',
    component: () => import('@/pages/EditMemberPage.vue'),
    meta: { requiresAuth: true, requiresEdit: true },
  },

  /**
   * Family Management Dashboard
   * 
   * Path: /family
   * Features:
   * - Dual-tab interface (Members + Relationships)
   * - Create new family members
   * - Edit existing family members
   * - Create/delete family relationships
   * - Family tree visualization
   * 
   * Access: Protected
   * Requirements: requiresAuth + requiresEdit permissions
   * - Admins and designated editors can access
   * 
   * Unauthorized redirect: → /
   */
  {
    path: '/family',
    name: 'FamilyManagement',
    component: () => import('@/pages/FamilyManagementPage.vue'),
    meta: { requiresAuth: true, requiresEdit: true },
  },

  /**
   * Search Interface
   * 
   * Path: /search
   * Features:
   * - Search family members by name
   * - Filter by birth date, death date, profession
   * - Display search results
   * - Link to individual member profiles
   * 
   * Access: Everyone
   */
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/pages/SearchPage.vue'),
  },

  /**
   * PROTECTED ROUTES - ADMIN ONLY
   * Require both authentication and admin role
   * Redirect unauthorized users to home page
   */

  /**
   * Admin Dashboard
   * 
   * Path: /admin
   * Features:
   * - System overview
   * - User management
   * - Audit logs
   * - Database status
   * 
   * Access: Protected (Admin only)
   * Requirements: requiresAuth + requiresAdmin
   * 
   * Unauthorized redirect: → /
   */
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/pages/AdminPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  /**
   * ARTICLE ROUTES
   * Public listing and viewing, protected administration
   */

  /**
   * Articles List Page
   * 
   * Path: /articles
   * Features:
   * - List all general articles
   * - Search and filter by category
   * - Sort by date
   * - Links to read individual articles
   * - Shows article metadata (author, date, category)
   * 
   * Access: Everyone
   */
  {
    path: '/articles',
    name: 'ArticlesList',
    component: () => import('@/pages/ArticlesListPage.vue'),
  },

  /**
   * View Single Article
   * 
   * Path: /articles/:id
   * Example: /articles/history-of-family, /articles/42
   * 
   * Displays:
   * - Full article content
   * - Article metadata (author, publish date, category)
   * - Edit/Delete buttons (for admins only)
   * - Links to related articles or family members
   * - Content in selected language if available
   * 
   * Access: Everyone (view), Admin only (edit/delete)
   */
  {
    path: '/articles/:id',
    name: 'Article',
    component: () => import('@/pages/ArticlePage.vue'),
  },

  /**
   * Manage Articles (Admin Dashboard)
   * 
   * Path: /admin/articles
   * Features:
   * - CRUD interface for general articles
   * - Create new article
   * - Edit existing articles
   * - Delete articles
   * - Preview articles
   * - Manage categories
   * 
   * Access: Protected (Admin only)
   * Requirements: requiresAuth + requiresAdmin
   * 
   * Unauthorized redirect: → /
   */
  {
    path: '/admin/articles',
    name: 'AdminArticles',
    component: () => import('@/pages/AdminArticlePage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

/**
 * CREATE ROUTER INSTANCE
 * 
 * Initializes Vue Router with:
 * - createWebHistory(): HTML5 history API (clean URLs without #)
 * - routes: Array of route definitions
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * ROUTE GUARD - BEFORE EACH NAVIGATION
 * 
 * Executed on every route transition
 * Checks access control requirements and redirects if needed
 * 
 * Process:
 * 1. Get authentication state from Pinia auth store
 * 2. Check if destination route requires authentication
 * 3. Check if user has required permissions
 * 4. Allow or redirect based on permissions
 * 
 * Guard Types:
 * 
 * requiresAuth - User must be logged in
 * - Typical routes: /member/:id/edit, /family, /admin
 * - Unauthorized redirect: /login
 * - User sees: "Please log in" message
 * 
 * requiresAdmin - User must have admin role
 * - Typical routes: /admin, /admin/articles
 * - Checks: authStore.isAdmin computed property
 * - Unauthorized redirect: / (home page)
 * - User sees: Regular homepage
 * 
 * requiresEdit - User must have edit permissions
 * - Typical routes: /member/:id/edit, /family
 * - Checks: authStore.canEdit computed property
 * - Unauthorized redirect: / (home page)
 * - Allows: Admins + designated editors
 * 
 * Access Control Matrix:
 * 
 * Route                    | Public | Authenticated | Editor | Admin
 * -------------------------|--------|---------------|--------|------
 * / (home)                 | ✓      | ✓             | ✓      | ✓
 * /login                   | ✓      | ✓             | ✓      | ✓
 * /member/:id              | ✓      | ✓             | ✓      | ✓
 * /member/:id/edit         | ✗      | ✗             | ✓      | ✓
 * /family                  | ✗      | ✗             | ✓      | ✓
 * /search                  | ✓      | ✓             | ✓      | ✓
 * /articles                | ✓      | ✓             | ✓      | ✓
 * /articles/:id            | ✓      | ✓             | ✓      | ✓
 * /admin                   | ✗      | ✗             | ✗      | ✓
 * /admin/articles          | ✗      | ✗             | ✗      | ✓
 * 
 * @param {RouteLocationNormalized} to - Destination route
 * @param {RouteLocationNormalized} from - Source route
 * @param {Function} next - Navigation callback function
 * 
 * @example
 * // User tries to access /admin without being admin
 * // Route has meta: { requiresAuth: true, requiresAdmin: true }
 * // Guard checks authStore.isAdmin (false)
 * // Calls next('/') - redirects to home page
 * 
 * @example
 * // User logs in then tries /member/42/edit
 * // Route has meta: { requiresAuth: true, requiresEdit: true }
 * // Guard checks authStore.isAuthenticated (true) + authStore.canEdit (true if editor)
 * // Calls next() - allows navigation
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check for authentication requirement
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // User not logged in, redirect to login page
    next('/login')
    return
  }

  // Check for admin requirement
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // User not admin, redirect to home page
    next('/')
    return
  }

  // Check for edit permission requirement
  if (to.meta.requiresEdit && !authStore.canEdit) {
    // User doesn't have edit permissions, redirect to home page
    next('/')
    return
  }

  // All permissions satisfied, allow navigation
  next()
})

/**
 * EXPORT ROUTER
 * 
 * Imported in main.js and used in Vue app:
 * app.use(router)
 * 
 * Available throughout app via:
 * - useRouter() composition function
 * - $router instance property
 * - Route meta, params, query access
 */
export default router
