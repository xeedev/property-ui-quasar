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
            {{ props.row.location?.name ?? 'N/A' }}
          </q-td>
          <q-td key="seller" :props="props">
            {{ props.row.sold_by?.name ?? 'N/A' }}
          </q-td>
          <q-td key="buyer" :props="props">
            {{ props.row.sold_to?.name ?? 'N/A' }}
          </q-td>
          <q-td key="status" :props="props">
            <q-badge :color="props.row.status === 'available' ? 'green' : 'red'">
              {{ props.row.status.toUpperCase() }}
            </q-badge>
          </q-td>
          <q-td auto-width>
            <q-btn size="sm" color="yellow-7" round dense icon="edit_square" @click="submit('Edit',props.row.id)" />
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
          <div class="col-md-12 col-sm-12 col-xs-12 q-pa-md">
            <q-card-section class="custom-border">
              <q-card-section>
                <div class="text-h6 text-dark">Deal Details
                  <q-chip v-if="action === 'Edit'" color="green-7" size="sm">{{selectedProperty}}</q-chip>
                </div>
              </q-card-section>
              <q-separator inset />
              <q-card-section>
                <q-form
                  @submit="save(selectedProperty)"
                  class="q-gutter-md"
                >
                  <q-input
                    outlined
                    v-model="property_number"
                    label="Property Number *"
                    lazy-rules
                    :rules="[ val => val && val.length > 0 || 'Please add Property Number']"
                  />
                  <q-select outlined v-model="location" :options="locations" :option-value="(locations) => locations === null ? null : locations.id" label="Select Location" :option-label="(locations) => locations === null ? null : locations.name"
                            :rules="[val => val !== null && val !== '' || 'Please select location']"
                  />
                  <q-select outlined v-model="seller" :options="users" :option-value="(users) => users === null ? null : users.id" label="Select Seller" :option-label="(users) => users === null ? null : users.name"
                            :rules="[val => val !== null && val !== '' || 'Please select Seller']"
                  />
                  <q-select outlined v-model="buyer" :options="users" :option-value="(users) => users === null ? null : users.id" label="Select Buyer" :option-label="(users) => users === null ? null : users.name"/>

                  <q-input
                    outlined
                    v-model="detail"
                    label="Detail"
                    hint="Detail"
                    type="textarea"
                  />
                  <div>
                    <p class="text-dark q-mt-md"><strong>Upload Images *</strong></p>
                    <div class="text-dark q-gutter-md" style="font-size: 2em">
                      <q-icon name="attachment" class="cursor-pointer" @click="$refs.image.click()" />
                    </div>
                    <input
                      style="display: none"
                      type="file"
                      ref="image"
                      multiple
                      accept="image/*"
                      @change="uploadImages"
                    />
                    <div class="row q-gutter-md">
                      <template v-for="(uploadedImage,index) in uploadedImages" :key="index">
                        <q-card class="my-card" :style="
                'background-image: url(' +
                uploadedImage +
                ');'
              ">
                          <q-icon name="close" class="absolute close bg-red-5 border-radius-inherit cursor-pointer" @click="removeUrl(index)"></q-icon>
                        </q-card>
                      </template>
                    </div>
                    <q-btn class="q-mt-md" :label="action === 'Edit' ? 'Update Property' : 'Add Property'" type="submit" color="yellow-7"/>
                  </div>
                </q-form>
              </q-card-section>
            </q-card-section>
          </div>
<!--          <q-separator v-if="$q.screen.xs || $q.screen.sm" inset/>-->
<!--          <div class="col-md-4 col-sm-12 col-xs-12 q-pa-md">-->
<!--            <q-card-section class="custom-border">-->
<!--              <q-card-section>-->
<!--                <div class="text-h6 text-dark">User Details</div>-->
<!--              </q-card-section>-->
<!--              <q-separator inset />-->
<!--              <q-card-section>-->

<!--&lt;!&ndash;                <p class="text-dark"><b>Name:</b> {{propertyDetail.user.name ?? 'N/A'}} </p>&ndash;&gt;-->
<!--&lt;!&ndash;                <p class="text-dark"><b>Email:</b> {{propertyDetail.user.email ?? 'N/A'}} </p>&ndash;&gt;-->
<!--&lt;!&ndash;                <p class="text-dark"><b>Contact:</b> {{propertyDetail.contact ?? 'N/A'}} </p>&ndash;&gt;-->
<!--&lt;!&ndash;                <p class="text-dark"><b>Address:</b> {{propertyDetail.address ?? 'N/A'}} </p>&ndash;&gt;-->
<!--&lt;!&ndash;                <p class="text-dark"><b>City:</b> {{propertyDetail.city ?? 'N/A'}} </p>&ndash;&gt;-->
<!--&lt;!&ndash;                <p class="text-dark"><b>Country:</b> {{propertyDetail.country ?? 'N/A'}} </p>&ndash;&gt;-->
<!--              </q-card-section>-->
<!--            </q-card-section>-->
<!--            <q-card-section class="text-center">-->

<!--              <q-form-->
<!--                @submit="save(selectedProperty)"-->
<!--                class="q-gutter-md"-->
<!--              >-->
<!--                <div>-->
<!--                  <q-btn type="submit" :color="propertyDetail.status === 'unpaid' ? 'green' : 'red'" :icon="propertyDetail.status === 'unpaid' ? 'task_alt' : 'close'" :disable="loading" :label="propertyDetail.status === 'unpaid' ? 'Mark as Paid' : 'Mark as Unpaid'" />-->
<!--                </div>-->
<!--              </q-form>-->
<!--            </q-card-section>-->
<!--          </div>-->
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
import imageCompression from "browser-image-compression";


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
    const uploadedImages = ref([])
    const users = ref([])
    const seller = ref('')
    const buyer = ref('')
    const locations = ref([])
    const property_number = ref('');
    const detail = ref('');
    const sold_by = ref('');
    const sold_to = ref('');
    const location = ref('');
    const action = ref('Add')
    const deleteLoading = ref({})
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
        ? originalRows.value.filter(row => row.property_number.includes(filter))
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
        if (row.property_number.includes(filter)) {
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

    async function submit(call,id = null){
      action.value = call;
      if (call === 'Edit'){
        selectedProperty.value = id
        let res = await Api.getOne('properties', {id});
        propertyDetail.value = res.data.data;
        property_number.value = res.data.data.property_number;
        location.value = propertyDetail?.value?.location?.id ? locations.value.find(obj => obj.id === propertyDetail.value.location.id) : '';
        seller.value = propertyDetail?.value?.sold_by?.id ? users.value.find(obj => obj.id === propertyDetail.value.sold_by.id) : '';
        buyer.value = propertyDetail?.value?.sold_to?.id ? users.value.find(obj => obj.id === propertyDetail.value.sold_to.id) : '';
        detail.value = res.data.data.detail;
        propertyDetail.value.media.forEach(media =>{
          uploadedImages.value.push(media.url)
        })

      }
      dialog.value = true
    }
    onMounted(async () => {
      onRequest({
        pagination: pagination.value,
        filter: undefined
      })
      let user = await Api.getList('users');
      users.value = user.data.data
      let location = await Api.getList('locations');
      locations.value = location.data.data
    })
    async function save(id=null, status= null){
      let res = null;
      if (action.value === 'Edit'){
        let payload = {
          property_number: property_number.value,
          detail: detail.value,
          sold_by_user_id: seller?.value?.id ?? null,
          sold_to_user_id: buyer?.value?.id ?? null,
          location_id: location?.value?.id ?? null,
          status: status ? status : propertyDetail.value.status,
          uploadedImages : uploadedImages.value,
        }
        payload = Object.assign({'id': id ?? selectedProperty.value},payload)
         res = await Api.put('properties',payload);
      }else{
        let payload = {
          property_number: property_number.value,
          detail: detail.value,
          sold_by_user_id: seller?.value?.id ?? null,
          sold_to_user_id: buyer?.value?.id ?? null,
          location_id: location?.value?.id ?? null,
          status: 'available',
          uploadedImages : uploadedImages.value,
        }
        res = await Api.post('properties',payload);
      }
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
    }
    function reset(){
      propertyDetail.value = null;
      property_number.value = null;
      location.value = null;
      seller.value = null;
      buyer.value = null;
      detail.value = '';
      uploadedImages.value = [];
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
    function uploadImages(event) {
      this.onFilesPicked(event);
    }
    const compressFile = (imageFile) => {
      let size = imageFile.size / 1024 / 1024; // in MiB
      if (size < 0.2) {
        return imageFile;
      }

      return new Promise((resolve, reject) => {
        let options = {
          maxSizeMB: 0.25,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        imageCompression(imageFile, options)
          .then(function(compressedFile) {
            resolve(compressedFile);
          })
          .catch(function(error) {
            reject(error.message);
          });
      });
    };
    async  function  onFilesPicked (event) {
      const files = event.target.files;
      let formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        file = await compressFile(file);
        console.log(file);
        formData.append('files[]', file);
      }

      if (!files.length) {
        return;
      }

      if (!files.length) {
        return;
      }

      $q.loading.show();
      axios
        .post(process.env.BASE_URL+'imageUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        })
        .then((response) => {
          let urls = response.data.urls;
          urls.forEach(url => {
            url = process.env.ROOT_URL+ '/' + url
            uploadedImages.value.push(url.replace('public/', 'storage/'))
          })
        });

      $q.loading.hide();
    }
    function removeUrl(index){
      uploadedImages.value.splice(index, 1);
    }

    return {
      action,
      seller,
      buyer,
      location,
      property_number,
      detail,
      users,
      locations,
      sold_by,
      sold_to,
      filter,
      loading,
      pagination,
      columns,
      rows,
      dialog,
      status,
      deleteLoading,
      selectedProperty,
      propertyDetail,
      uploadedImages,
      removeUrl,
      compressFile,
      onFilesPicked,
      uploadImages,
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
.my-card{
  height: 100px;
  width: 100px;
  background-size: cover;
}
.custom-border{
  border: 2px solid black;
  border-radius: 10px;
}
</style>
