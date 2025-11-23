import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
  },
  {
    path: '/member/:id',
    name: 'FamilyMember',
    component: () => import('@/pages/FamilyMemberPage.vue'),
  },
  {
    path: '/member/:id/edit',
    name: 'EditMember',
    component: () => import('@/pages/EditMemberPage.vue'),
    meta: { requiresAuth: true, requiresEdit: true },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/pages/SearchPage.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/pages/AdminPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/articles',
    name: 'ArticleEditor',
    component: () => import('@/pages/ArticleEditorPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else if (to.meta.requiresEdit && !authStore.canEdit) {
    next('/')
  } else {
    next()
  }
})

export default router
