<template>
  <q-page class="row">
    <div class="q-pa-md row items-start q-gutter-md justify-center">
      <q-card class="my-card bg-green-5">
        <q-card-section class="q-ma-xl">
          <div class="row justify-center items-center text-white text-center">
            Total Customers
            <br>
            {{ statistics.customers }}
          </div>
        </q-card-section>
      </q-card>
      <q-card class="my-card bg-amber-5 cursor-pointer" @click="$router.push('deals')">
        <q-card-section class="q-ma-xl">
          <div class="row justify-center items-center text-white text-center">
            All Deals
            <br>
            {{ statistics.properties }}
          </div>
        </q-card-section>
      </q-card>
      <q-card class="my-card bg-red-5 cursor-pointer" @click="$router.push('deals')">
        <q-card-section class="q-ma-xl">
          <div class="row justify-center items-center text-white text-center">
            Pending Deals
            <br>
            {{ statistics.pendingDeals }}
          </div>
        </q-card-section>
      </q-card>
      <q-card class="my-card bg-blue-5 cursor-pointer" @click="$router.push('deals')">
        <q-card-section class="q-ma-xl">
          <div class="row justify-center items-center text-white text-center">
            Today's Deals
            <br>
            {{ statistics.todaysDeals }}
          </div>
        </q-card-section>
      </q-card>
      <q-card class="my-card bg-dark cursor-pointer" @click="$router.push('societies')">
        <q-card-section class="q-ma-xl">
          <div class="row justify-center items-center text-white text-center">
            Total Societies
            <br>
            {{ statistics.societies }}
          </div>
        </q-card-section>
      </q-card>
<!--      <q-card class="my-card bg-grey cursor-pointer" @click="$router.push('categories')">-->
<!--        <q-card-section class="q-ma-xl">-->
<!--          <div class="row justify-center items-center text-white text-center">-->
<!--            Total Categories-->
<!--            <br>-->
<!--            {{ statistics.categories }}-->
<!--          </div>-->
<!--        </q-card-section>-->
<!--      </q-card>-->
    </div>
  </q-page>
</template>

<script lang="ts">
import { Todo, Meta } from 'components/models';
import Api from 'src/services/api';
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'DashboardPage',
  setup() {
    onMounted( async () =>{
      let res = await Api.getList('statistics');
      statistics.value = res.data
    });
    const todos = ref<Todo[]>([
      {
        id: 1,
        content: 'ct1',
      },
      {
        id: 2,
        content: 'ct2',
      },
      {
        id: 3,
        content: 'ct3',
      },
      {
        id: 4,
        content: 'ct4',
      },
      {
        id: 5,
        content: 'ct5',
      },
    ]);
    const meta = ref<Meta>({
      totalCount: 1200,
    });
    const statistics = ref('');
    return { todos, meta,statistics };
  },
});
</script>
<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 250px
</style>
