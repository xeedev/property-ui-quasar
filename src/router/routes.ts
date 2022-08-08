import { RouteRecordRaw } from 'vue-router';
import Api from 'src/services/api';

const routes: RouteRecordRaw[] = [

  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/LoginPage.vue') },
    ],
  },
  {
    path: '/',
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
