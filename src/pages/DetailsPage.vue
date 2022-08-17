<template>
  <div v-if="product">
    <div :class="$q.screen.sm || $q.screen.xs ? '' : 'row q-pa-xl'">
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
          <span class="text-subtitle1">
            <q-badge color="green-7">
              Rs: {{product.demand ?? 'N/A'}}
            </q-badge>
          </span>

          <p class="text-subtitle2 q-mb-none q-mt-md">Final Price</p>
          <span class="text-subtitle1">
            <q-badge color="red-7">
              Rs: {{product.negotiated_price ?? 'N/A'}}
            </q-badge>
          </span>

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
    <div :class="$q.screen.sm || $q.screen.xs ? '' : 'row q-pa-xl'">
      <q-table
        style="width: 100%"
        title="Treats"
        :rows="rows"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :loading="loading"
        :filter="filter"
        @request="onRequest"
        binary-state-sort
      >
        <template v-slot:top>
          <q-space />
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.value }}
            </q-td>
<!--            <q-td auto-width>-->
<!--              <q-btn size="sm" color="yellow-7" round dense icon="edit" @click="submit('Edit',props.row.id)" />-->
<!--            </q-td>-->
            <q-td auto-width>
              <q-btn size="sm" color="red" :key="props.row.id" :loading="deleteLoading[`deleteLoading-${props.row.id}`]" round dense icon="delete" @click="deleteLead(props.row.id)" />
            </q-td>
          </q-tr>
        </template>

      </q-table>

<!--      <q-dialog-->
<!--        v-model="dialog"-->
<!--        persistent-->
<!--        maximized-->
<!--        transition-show="slide-up"-->
<!--        transition-hide="slide-down"-->
<!--      >-->
<!--        <q-card class="text-white">-->
<!--          <q-bar class="bg-green-7">-->
<!--            <q-space />-->
<!--            <q-btn dense flat icon="close" v-close-popup @click="reset">-->
<!--              <q-tooltip class="bg-white text-primary">Close</q-tooltip>-->
<!--            </q-btn>-->
<!--          </q-bar>-->

<!--          <q-card-section>-->
<!--            <div class="text-h6 text-dark">{{action}} Block</div>-->
<!--          </q-card-section>-->

<!--          <q-card-section>-->
<!--            <q-form-->
<!--              @submit="save(action)"-->
<!--              class="q-gutter-md"-->
<!--            >-->
<!--              <q-input-->
<!--                outlined-->
<!--                v-model="name"-->
<!--                label="Block Name *"-->
<!--                lazy-rules-->
<!--                :rules="[ val => val && val.length > 0 || 'Please add Block Name']"-->
<!--              />-->
<!--              <q-input-->
<!--                outlined-->
<!--                v-model="notes"-->
<!--                label="Notes"-->
<!--                hint="Notes"-->
<!--                type="textarea"-->
<!--              />-->
<!--              <div>-->
<!--                <q-btn :label="action === 'Edit' ? 'Update Block' : 'Add Block'" type="submit" color="yellow-7"/>-->
<!--              </div>-->
<!--            </q-form>-->
<!--          </q-card-section>-->
<!--        </q-card>-->
<!--      </q-dialog>-->
    </div>
  </div>
</template>

<script>
import {onMounted, ref} from 'vue';
import Api from '../services/api';
import {useRouter} from 'vue-router';
import {useQuasar} from 'quasar';

const columns = [

  {
    name: 'sold_by',
    required: true,
    label: 'Sold By',
    align: 'left',
    field: row => row.sold_by.name,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'sold_to',
    required: true,
    label: 'Sold To',
    align: 'left',
    field: row => row.sold_to?.name,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'demand',
    required: true,
    label: 'Demand',
    align: 'right',
    field: row => row.demand,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'sold_in',
    required: true,
    label: 'Sold In',
    align: 'right',
    field: row => row.sold_in,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'actual_commission',
    required: true,
    label: 'Actual Commission',
    align: 'right',
    field: row => row.actual_commission_amount,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'commission_received',
    required: true,
    label: 'Commission Received',
    align: 'right',
    field: row => row.commission_received,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'date',
    required: true,
    label: 'Date',
    align: 'left',
    field: row => row.created_at,
    format: val => `${val}`,
    sortable: true
  },
]

const originalRows = ref([])
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

    const deleteLoading = ref({})
    const selectedBlock = ref('')
    const notes = ref('')
    const price = ref(1)
    const rows = ref([])
    const filter = ref('')
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10
    })
    const action = ref('');
    const dialog = ref(false);
    const blocks = ref([]);
    const block = ref('');
    function fetchFromServer (startRow, count, filter, sortBy, descending) {
      const data = filter
        ? originalRows.value.filter(row => row.sold_by.name.includes(filter))
        : originalRows.value.slice()

      // handle sortBy
      if (sortBy) {
        const sortFn = sortBy === 'desc'
          ? (descending
              ? (a, b) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0)
              : (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
          )
          : (descending
              ? (a, b) => (parseFloat(b[ sortBy ]) - parseFloat(a[ sortBy ]))
              : (a, b) => (parseFloat(a[ sortBy ]) - parseFloat(b[ sortBy ]))
          )
        data.sort(sortFn)
      }

      return data.slice(startRow, startRow + count)
    }

    function getRowsNumberCount (filter) {
      if (!filter) {
        return originalRows.value.length
      }
      let count = 0
      originalRows.value.forEach(row => {
        if (row.sold_by.name.includes(filter)) {
          ++count
        }
      })
      return count
    }

    async function onRequest (props) {
      loading.value = true
      originalRows.value = product.value?.leads;
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter
      // update rowsCount with appropriate value
      pagination.value.rowsNumber = await getRowsNumberCount(filter)
      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage
      // calculate starting row of data
      const startRow = (page - 1) * rowsPerPage
      // fetch data from "server"
      const returnedData = fetchFromServer(startRow, fetchCount, filter, sortBy, descending)
      // clear out existing data and add new
      rows.value.splice(0, rows.value.length, ...returnedData)
      // don't forget to update local pagination object
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending
      // ...and turn of loading indicator
      loading.value = false
    }

    // async function submit(val,id = null){
    //   action.value = val;
    //   if (val === 'Edit'){
    //     selectedBlock.value = id
    //     let res = await Api.getOne('blocks', {id});
    //     let block = res.data.data;
    //     name.value = block.name
    //     notes.value = block.notes
    //   }
    //   dialog.value = true
    // }
    // async function save(action){
    //   let payload = {
    //     'name' : name.value,
    //     'notes' : notes.value,
    //   }
    //   let res = null;
    //   if (action === 'Add'){
    //     res = await Api.post('blocks',payload);
    //   }else{
    //     payload = Object.assign({'id': selectedBlock.value},payload)
    //     res = await Api.put('blocks',payload);
    //   }
    //   if (res.data.success){
    //     $q.notify({
    //       color: 'green-4',
    //       textColor: 'white',
    //       icon: 'cloud_done',
    //       message: 'Success',
    //     });
    //     onRequest({
    //       pagination: pagination.value,
    //       filter: filter.value
    //     })
    //     reset()
    //     dialog.value = false
    //   }else{
    //     $q.notify({
    //       color: 'red-4',
    //       textColor: 'white',
    //       icon: 'cloud_done',
    //       message: 'Something went wrong',
    //     });
    //   }
    // }
    function reset(){
      name.value = null
      notes.value = null
    }
    async function deleteLead(id){
      deleteLoading.value[`deleteLoading-${id}`] =  true
      let res = await Api.delete('leads',{id})
      if (res.data.success){
        rows.value.splice(id, 1);
      }
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
      deleteLoading.value[`deleteLoading-${id}`] =  false
    }


    onMounted(async () => {
      let res = await Api.getOne('properties',{'id':router.currentRoute.value.params.id});
      product.value = res.data.data
      product.value?.media.push({
        url:'/public/property.jfif'
      })
      onRequest({
        pagination: pagination.value,
        filter: undefined
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
      filter,
      loading,
      pagination,
      columns,
      rows,
      action,
      dialog,
      notes,
      price,
      blocks,
      block,
      deleteLoading,
      selectedBlock,
      onRequest,
      // submit,
      // save,
      reset,
      deleteLead
    };
  },
};
</script>
