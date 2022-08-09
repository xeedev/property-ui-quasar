<template>
  <div class="q-pa-md">
    <q-table
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
        <q-btn color="yellow-7" icon="add" :disable="loading" :label="$q.screen.xs || $q.screen.sm ? '' : 'Add Deal'" @click="submit('Add')" />
        <q-space />
        <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="property_number" :props="props">
            {{ props.row.property_number }}
          </q-td>
          <q-td key="location" :props="props">
            {{ props.row.location.name }}
          </q-td>
          <q-td key="seller" :props="props">
            {{ props.row.sold_by.name }}
          </q-td>
          <q-td key="buyer" :props="props">
            {{ props.row.sold_to.name ?? 'N/A' }}
          </q-td>
          <q-td key="status" :props="props">
            <q-badge :color="props.row.status === 'available' ? 'red' : 'green'">
              {{ props.row.status.toUpperCase() }}
            </q-badge>
          </q-td>
          <q-td auto-width>
            <q-btn size="sm" color="yellow-7" round dense icon="visibility" @click="submit('Edit',props.row.id)" />
          </q-td>
          <q-td auto-width>
            <q-btn size="sm" color="red" :key="props.row.id" :loading="deleteLoading[`deleteLoading-${props.row.id}`]" round dense icon="delete" @click="deleteOrder(props.row.id)" />
          </q-td>
        </q-tr>
      </template>

    </q-table>

    <q-dialog
      v-model="dialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="text-white">
        <q-bar class="bg-green-7">
          <q-space />
          <q-btn dense flat icon="close" v-close-popup @click="reset">
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
        <div class="row">
          <div class="col-md-8 col-sm-12 col-xs-12 q-pa-md">
            <q-card-section class="custom-border">
              <q-card-section>
                <div class="text-h6 text-dark">Order Details {{selectedProperty}}</div>
              </q-card-section>
              <q-separator inset />
              <q-card-section>
                <q-carousel
                  swipeable
                  animated
                  arrows
                  v-model="slide"
                  v-model:fullscreen="fullscreen"
                  infinite
                  thumbnails
                >
                  <template v-for="(productImage, index) in  propertyDetail?.media" :key="index">
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
<!--                <p class="text-dark"><b>Order Id:</b> {{propertyDetail.id}} </p>-->
<!--                <p class="text-dark"><b>Description:</b> {{propertyDetail.description}} </p>-->
<!--                <p class="text-dark"><b>Total:</b> {{propertyDetail.total}} </p>-->
<!--                <p class="text-dark"><b>Transaction ID:</b> {{propertyDetail.transaction_id ?? 'N/A'}} </p>-->
<!--                <p class="text-dark"><b>Address:</b> {{propertyDetail.address ?? 'N/A'}} </p>-->
<!--                <p class="text-dark"><b>City:</b> {{propertyDetail.city ?? 'N/A'}} </p>-->
<!--                <p class="text-dark"><b>Country:</b> {{propertyDetail.country ?? 'N/A'}} </p>-->
<!--                <p class="text-dark"><b>Status: </b>-->
<!--                  <q-badge :color="propertyDetail.status === 'unpaid' ? 'red' : 'green'">-->
<!--                    {{propertyDetail.status.toUpperCase() ?? 'N/A'}}-->
<!--                  </q-badge>-->
<!--                </p>-->
              </q-card-section>
            </q-card-section>
          </div>
          <q-separator v-if="$q.screen.xs || $q.screen.sm" inset/>
          <div class="col-md-4 col-sm-12 col-xs-12 q-pa-md">
            <q-card-section class="custom-border">
              <q-card-section>
                <div class="text-h6 text-dark">User Details</div>
              </q-card-section>
              <q-separator inset />
              <q-card-section>

<!--                <p class="text-dark"><b>Name:</b> {{propertyDetail.user.name ?? 'N/A'}} </p>-->
<!--                <p class="text-dark"><b>Email:</b> {{propertyDetail.user.email ?? 'N/A'}} </p>-->
<!--                <p class="text-dark"><b>Contact:</b> {{propertyDetail.contact ?? 'N/A'}} </p>-->
<!--                <p class="text-dark"><b>Address:</b> {{propertyDetail.address ?? 'N/A'}} </p>-->
<!--                <p class="text-dark"><b>City:</b> {{propertyDetail.city ?? 'N/A'}} </p>-->
<!--                <p class="text-dark"><b>Country:</b> {{propertyDetail.country ?? 'N/A'}} </p>-->
              </q-card-section>
            </q-card-section>
            <q-card-section class="text-center">

              <q-form
                @submit="save(selectedProperty)"
                class="q-gutter-md"
              >
                <div>
                  <q-btn type="submit" :color="propertyDetail.status === 'unpaid' ? 'green' : 'red'" :icon="propertyDetail.status === 'unpaid' ? 'task_alt' : 'close'" :disable="loading" :label="propertyDetail.status === 'unpaid' ? 'Mark as Paid' : 'Mark as Unpaid'" />
                </div>
              </q-form>
            </q-card-section>
          </div>
        </div>

      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import Api from '../services/api';
import axios from 'axios';


const columns = [
  {
    name: 'property_number',
    required: true,
    label: 'Property Number',
    align: 'left',
    field: row => row.property_number,
    sortable: true
  },
  {
    name: 'location',
    required: true,
    label: 'Society',
    align: 'left',
    field: row => row.location.name,
    sortable: true
  },
  {
    name: 'seller',
    required: true,
    label: 'Seller',
    align: 'left',
    field: row => row.total,
    format: val => val,
    sortable: true
  },
  {
    name: 'buyer',
    required: true,
    label: 'Buyer',
    align: 'left',
    field: row => row.total,
    format: val => val,
    sortable: true
  },
  {
    name: 'status',
    required: true,
    label: 'Status',
    align: 'left',
    field: row => row.status,
    // format: val => `${val}`,
    sortable: true
  },
]

const originalRows = ref([])

export default {
  setup () {
    const action = ref('Add')
    const deleteLoading = ref({})
    const updateStatus = ref({})
    const propertyDetail = ref('')
    const $q = useQuasar()
    const selectedProperty = ref('')
    const status = ref('')
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
    const dialog = ref(false);
    function fetchFromServer (startRow, count, filter, sortBy, descending) {
      const data = filter
        ? originalRows.value.filter(row => row.description.includes(filter))
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
        if (row.description.includes(filter)) {
          ++count
        }
      })
      return count
    }

    async function onRequest (props) {
      loading.value = true
      let properties = await Api.getList('properties');
      originalRows.value = properties.data.data;
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

    async function submit(action,id = null){
      if (action === 'Edit'){
        selectedProperty.value = id
        let res = await Api.getOne('properties', {id});
        propertyDetail.value = res.data.data;
      }
      dialog.value = true
    }
    onMounted(async () => {
      onRequest({
        pagination: pagination.value,
        filter: undefined
      })
    })
    async function save(id=null, status= null){
      updateStatus.value[`updateStatus-${id}`] =  true
      let updatedStatus = status ? status : propertyDetail.value.status;
      let payload = {
        'status' : updatedStatus === 'unpaid' ? 'paid' : 'unpaid',
      }
      payload = Object.assign({'id': id ?? selectedProperty.value},payload)
      let res = await Api.put('properties',payload);
      if (res.data.success){
        $q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Success',
        });
        onRequest({
          pagination: pagination.value,
          filter: filter.value
        })
        reset()
        dialog.value = false
      }else{
        $q.notify({
          color: 'red-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Something went wrong',
        });
      }
      updateStatus.value[`updateStatus-${id}`] =  false
    }
    function reset(){
      status.value = ''
    }
    async function deleteOrder(id){
      deleteLoading.value[`deleteLoading-${id}`] =  true
      let res = await Api.delete('properties',{id})
      if (res.data.success){
        rows.value.splice(id, 1);
      }
      onRequest({
        pagination: pagination.value,
        filter: filter.value
      })
      deleteLoading.value[`deleteLoading-${id}`] =  false
    }

    return {
      slide: ref(1),
      fullscreen: ref(false),
      filter,
      loading,
      pagination,
      columns,
      rows,
      dialog,
      status,
      deleteLoading,
      updateStatus,
      selectedProperty,
      propertyDetail,
      onRequest,
      submit,
      save,
      reset,
      deleteOrder
    }
  }
}
</script>
<style scoped>
.custom-border{
  border: 2px solid black;
  border-radius: 10px;
}
</style>
