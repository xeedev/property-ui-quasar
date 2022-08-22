<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-green-5">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Pride Properties </q-toolbar-title>
        <q-space></q-space>
        <q-btn color="yellow-7" label="Logout" @click="logout">
          <!-- <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="$router.push('/login')">
                <q-item-section>Logout</q-item-section>
              </q-item>
              <q-separator />
            </q-list>
          </q-menu> -->
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          <q-img
            src="/download.jfif"
            spinner-color="white"
            @click="$router.push('/dashboard')"
            fit="contain"
            height="80px"
            class="q-ma-sm cursor-pointer"
            style="max-width: 150px"
          />
        </q-item-label>
        <template v-for="(essentialLink,index) in essentialLinks" :key="index">
          <q-item clickable tag="a" @click="$router.push(essentialLink.link)">
            <q-item-section avatar>
              <q-icon :name="essentialLink.icon" color="yellow-7" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{essentialLink.title}}</q-item-label>
              <q-item-label caption class="text-yellow-7">{{essentialLink.caption}}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Api from 'src/services/api';
import { useRouter } from 'vue-router'
// import EssentialLink from 'components/EssentialLink.vue';
const linksList = [
  {
    title: 'Home',
    caption: 'View Deals',
    icon: 'home',
    link: '/',
  },
  {
    title: 'Dashboard',
    caption: 'Statistics',
    icon: 'dashboard',
    link: '/dashboard',
  },
  {
    title: 'Customers',
    caption: 'Manage Customers',
    icon: 'account_circle',
    link: '/customers',
  },
  {
    title: 'Deals',
    caption: 'Track Deals',
    icon: 'trending_up',
    link: '/deals',
  },
  {
    title: 'Societies',
    caption: 'Manage Societies',
    icon: 'category',
    link: '/societies',
  },
  {
    title: 'Blocks',
    caption: 'Manage Blocks',
    icon: 'sort_by_alpha',
    link: '/blocks',
  },
  {
    title: 'Maps',
    caption: 'Manage Maps',
    icon: 'maps',
    link: '/maps',
  },
  // {
  //   title: 'Media',
  //   caption: 'Manage Gallery',
  //   icon: 'image',
  //   link: 'gallery',
  // },
];

export default defineComponent({
  name: 'MainLayout',

  components: {
    // EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const router = useRouter()
    async function logout(){
      await Api.post('logout');
      localStorage.removeItem('token')
      localStorage.removeItem('token_check')
      router.push({path:'/login'})
    }

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      logout,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
