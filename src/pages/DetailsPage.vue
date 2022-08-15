<template>
  <div>
    <div :class="$q.screen.sm || $q.screen.xs ? '' : 'row q-pa-xl'" v-if="product">
      <div class="col-md-6 col-sm-12">
        <q-btn fab-mini icon="arrow_back" class="q-mt-md q-ml-md" color="grey-7" @click="$router.push('/')" />
        <h6>Property Details</h6>
        <q-card>
          <q-carousel
            swipeable
            animated
            arrows
            v-model="slide"
            v-model:fullscreen="fullscreen"
            infinite
            thumbnails
          >
            <template v-for="(productImage, index) in  product?.media" :key="index">
              <q-carousel-slide
                :name="index+1"
                :img-src="productImage.url"
              />
            </template>

            <template v-slot:control>
              <q-carousel-control position="bottom-right" :offset="[18, 18]">
                <q-btn
                  push
                  round
                  dense
                  color="white"
                  text-color="primary"
                  :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
                  @click="fullscreen = !fullscreen"
                />
              </q-carousel-control>
            </template>
          </q-carousel>
        </q-card>
        <div class="q-pa-md">
          <p class="text-subtitle2 q-mb-none q-mt-md">Property</p>
          <span class="text-subtitle1">
          #{{product.property_number}}-Block {{product.block.name}}-{{product.location.name}}
          <q-badge :color="product.status === 'available' ? 'green' : 'red'">
              {{ product.status.toUpperCase() }}
            </q-badge>
        </span>
          <p class="text-subtitle2 q-mb-none q-mt-md">Demand</p>
          <span class="text-subtitle1"> Rs: {{product.demand ?? 'N/A'}}</span>

          <p class="text-subtitle2 q-mb-none q-mt-md">Negotiated Price</p>
          <span class="text-subtitle1"> Rs: {{product.negotiated_price ?? 'N/A'}}</span>

          <p class="text-subtitle2 q-mb-none q-mt-md">Sold By</p>
          <span class="text-subtitle1"> Name: {{product?.sold_by?.name ?? 'N/A'}}</span><br/>
          <span class="text-subtitle1"> Contact: {{product?.sold_by?.contact ?? 'N/A'}}</span><br/>
          <span class="text-subtitle1"> Email: {{product?.sold_by?.email ?? 'N/A'}}</span><br/>
          <span class="text-subtitle1"> Notes: {{product?.sold_by?.notes ?? 'N/A'}}</span><br/>

          <p class="text-subtitle2 q-mb-none q-mt-md">Sold To</p>
          <span class="text-subtitle1"> {{product?.sold_to?.name ?? 'N/A'}}</span>
          <span class="text-subtitle1"> Contact: {{product?.sold_to?.contact ?? 'N/A'}}</span><br/>
          <span class="text-subtitle1"> Email: {{product?.sold_to?.email ?? 'N/A'}}</span><br/>
          <span class="text-subtitle1"> Notes: {{product?.sold_to?.notes ?? 'N/A'}}</span><br/>
          <q-separator></q-separator>
          <p class="text-subtitle2 q-mb-none q-mt-md">Details</p>
          <span class="text-subtitle1"> {{product.detail ?? 'N/A'}}</span>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Api from '../services/api';
import {useRouter} from 'vue-router';
import {useQuasar} from 'quasar';

export default {
  setup() {
    const router = useRouter();
    const $q = useQuasar()
    const product = ref();
    const name = ref();
    const quantity = ref(1);
    const email = ref();
    const contact = ref();
    const message = ref();
    const alert=  ref(false);
    const submitLoading = ref(false)

      onMounted(async () => {
      let res = await Api.getOne('properties',{'id':router.currentRoute.value.params.id});
      product.value = res.data.data
      product.value?.media.push({
        url:'/public/property.jfif'
      })
    })
    return {
      slide: ref(1),
      fullscreen: ref(false),
      name,
      email,
      contact,
      message,
      product,
      alert,
      submitLoading,
      quantity,
    };
  },
};
</script>
