import { RouteRecordRaw } from 'vue-router';
import Api from 'src/services/api';

const routes: RouteRecordRaw[] = [

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/HomePage.vue') },
    ],
    beforeEnter: async (to, from, next) =>
    {
      if (await IsAuthenticated()) next();
      else next('/login');
    }
  },
  {
    path: '/property/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/DetailsPage.vue') }],
  },
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/LoginPage.vue') },
    ],
  },
  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/DashboardPage.vue') },
    ],
    beforeEnter: async (to, from, next) =>
    {
      if (await IsAuthenticated()) next();
      else next('/login');
    }
  },
  {
    path: '/customers',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/CustomerPage.vue') },
    ],
    beforeEnter: async (to, from, next) =>
    {
      if (await IsAuthenticated()) next();
      else next('/login');
    }
  },
  {
    path: '/societies',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/SocietyPage.vue') },
    ],
    beforeEnter: async (to, from, next) =>
    {
      if (await IsAuthenticated()) next();
      else next('/login');
    }
  },
  {
    path: '/deals',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/DealPage.vue') },
    ],
    beforeEnter: async (to, from, next) =>
    {
      if (await IsAuthenticated()) next();
      else next('/login');
    }
  },

  // {
  //   path: '/products',
  //   component: () => import('layouts/DashboardLayout.vue'),
  //   children: [
  //     { path: '', component: () => import('src/pages/DisplayProductsPage.vue') },
  //   ],
  //   beforeEnter: async (to, from, next) =>
  //   {
  //     if (await IsAuthenticated()) next();
  //     else next('/login');
  //   }
  // },
  // {
  //   path: '/categories',
  //   component: () => import('layouts/DashboardLayout.vue'),
  //   children: [
  //     { path: '', component: () => import('src/pages/ManageCategoriesPage.vue') },
  //   ],
  //   beforeEnter: async (to, from, next) =>
  //   {
  //     if (await IsAuthenticated()) next();
  //     else next('/login');
  //   }
  // },
  // {
  //   path: '/orders',
  //   component: () => import('layouts/DashboardLayout.vue'),
  //   children: [
  //     { path: '', component: () => import('src/pages/ManageOrdersPage.vue') },
  //   ],
  //   beforeEnter: async (to, from, next) =>
  //   {
  //     if (await IsAuthenticated()) next();
  //     else next('/login');
  //   }
  // },
  // {
  //   path: '/gallery',
  //   component: () => import('layouts/DashboardLayout.vue'),
  //   children: [
  //     { path: '', component: () => import('src/pages/ManageGalleryPage.vue') },
  //   ],
  //   beforeEnter: async (to, from, next) =>
  //   {
  //     if (await IsAuthenticated()) next();
  //     else next('/login');
  //   }
  // },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];
async function IsAuthenticated(){
  const res =   await Api.getList( 'validateToken');
  return !!res?.data?.authenticated;
}

export default routes;
