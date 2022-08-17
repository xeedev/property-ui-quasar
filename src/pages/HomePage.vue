<template>
  <div class="q-gutter-y-sm">
    <div class="row justify-center">
      <template
        v-for="(property, index) in properties"
        :key="index"
      >
        <q-card
          class="text-dark my-card q-ma-md cursor-pointer"
          @click="$router.push('/property/'+ property.id)"
        >
          <q-img :src="property?.media[0]?.url ? property?.media[0]?.url : '/property.jfif'" spinner-color="black" style="height: 280px" />

          <q-card-section>
            <div class="row no-wrap items-center">
              <div class="col text-h6 ellipsis">
                {{property.name}}
              </div>
            </div>
            <q-badge class="q-ml-md" :color="property.status === 'available' ? 'green' : 'red'">
              {{ property.status.toUpperCase() }} </q-badge> <br/>
            <span class="q-ml-md"><strong>Demand: {{property.demand ?? 'N/A'}}</strong></span> <br/>
            <span class="q-ml-md"><strong>Final: {{property.negotiated_price ?? 'N/A'}}</strong></span>
          </q-card-section>

          <q-separator />

          <q-card-actions>
            <q-btn flat color="green-7"> View Details</q-btn>
          </q-card-actions>
        </q-card>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref,onMounted } from 'vue';
import { useQuasar } from 'quasar';
import Api from 'src/services/api';
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'IndexPage',
  setup() {
    const properties = ref([]);
    const allProducts = ref([]);
    const images = ref([]);
    const slide = ref(1);
    const tab = ref('all');
    const addingToCart = ref({});
    const categories = ref(['all']);
    const $q = useQuasar();
    const router = useRouter();
    onMounted(async () => {
      let response = await Api.getList('properties')
      properties.value = response.data.data
    })
    return {
      slide,
      images,
      properties,
      allProducts,
      addingToCart,
      tab,
      stars: ref(5),
      categories,
    };
  },
});

</script>
<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 300px
.full-width
  width: 100%
.custom-caption
  width: 100%
  text-align: center
  padding: 50px 20px
  color: white
  background-color: rgba(0, 0, 0, 0.6)
  font-family: Circular-loom,serif
.text-subtitle2
  font-size: 1.375rem
  margin-top: 20px
</style>
