<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-green-5">
      <q-toolbar>
<!--        <q-btn-->
<!--          flat-->
<!--          dense-->
<!--          round-->
<!--          icon="menu"-->
<!--          aria-label="Menu"-->
<!--          @click="toggleLeftDrawer"-->
<!--        />-->

<!--        <q-toolbar-title> Pride Properties </q-toolbar-title>-->
<!--        <q-space></q-space>-->
<!--        <q-btn class="bg-yellow-5" label="Logout" @click="logout">-->
          <!-- <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="$router.push('/login')">
                <q-item-section>Logout</q-item-section>
              </q-item>
              <q-separator />
            </q-list>
          </q-menu> -->
<!--        </q-btn>-->
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent} from 'vue';
export default defineComponent({
  name: 'MainLayout',
});
</script>
