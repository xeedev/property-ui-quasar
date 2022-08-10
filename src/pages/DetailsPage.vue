<template>
  <div>
    <div :class="$q.screen.sm || $q.screen.xs ? '' : 'row q-pa-xl'">
      <div class="col-md-6 col-sm-12">
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
