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
        <q-btn color="yellow-7" icon="add" :disable="loading" :label="$q.screen.xs || $q.screen.sm ? '' : 'Add Map'" @click="submit('Add')" />
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
          <q-td auto-width>
            <q-btn size="sm" color="yellow-7" round dense icon="edit" @click="submit('Edit',props.row.id)" />
          </q-td>
          <q-td auto-width>
            <q-btn size="sm" color="red" :key="props.row.id" :loading="deleteLoading[`deleteLoading-${props.row.id}`]" round dense icon="delete" @click="deleteMap(props.row.id)" />
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

        <q-card-section>
          <div class="text-h6 text-dark">{{action}} Map</div>
        </q-card-section>

        <q-card-section>
          <q-form
            @submit="save(action)"
            class="q-gutter-md"
          >
            <q-input
              outlined
              v-model="name"
              label="Map Name *"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please add Map Name']"
            />
            <q-input
              outlined
              v-model="type"
              label="Map Type *"
              lazy-rules
              :rules="[ val => val && val.length > 0 && (val === 'pdf' || val === 'image') || 'Please add pdf or image']"
            />
            <div class="row q-gutter-md">
              <q-card class="my-card cursor-pointer" @click="$refs.image.click()">
                <q-card-section class="q-ma-none q-pa-none section">
                  <q-icon name="perm_mediac" class="text-dark" size="xl" />
                </q-card-section>
              </q-card>
              <input
                style="display: none"
                type="file"
                ref="image"
                accept="image/*"
                @change="uploadFile"
              />
                <q-card v-if="!!uploadedImage" class="my-card" :style="
                'background-image: url(' +
                uploadedImage +
                '); background-size: cover'
              ">
                  <q-icon name="close" class="absolute close bg-red-5 border-radius-inherit cursor-pointer" @click="uploadedImage = ''"></q-icon>
                </q-card>
            </div>
            <div>
              <q-btn :label="action === 'Edit' ? 'Update Map' : 'Add Map'" type="submit" color="yellow-7"/>
            </div>
          </q-form>
        </q-card-section>
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
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'type', align: 'left', label: 'Type', field: 'type', sortable: true, format: val => val ? val.substring(0,100) : 'N/A'},
]

const originalRows = ref([])

export default {
  setup () {
    const uploadedImage = ref(null)
    const deleteLoading = ref({})
    const $q = useQuasar()
    const selectedMap = ref('')
    const name = ref('')
    const type = ref('')
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
        ? originalRows.value.filter(row => row.name.includes(filter))
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
        if (row.name.includes(filter)) {
          ++count
        }
      })
      return count
    }

    async function onRequest (props) {
      loading.value = true
      let blocks = await Api.getList('maps');
      originalRows.value = blocks.data.data;
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

    async function submit(val,id = null){
      action.value = val;
      if (val === 'Edit'){
        selectedMap.value = id
        let res = await Api.getOne('maps', {id});
        let block = res.data.data;
        name.value = block.name
        type.value = block.type
      }
      dialog.value = true
    }
    onMounted(async () => {
      onRequest({
        pagination: pagination.value,
        filter: undefined
      })
    })
    function uploadFile(event) {
      this.onFilesPicked(event);
    }
    async  function  onFilesPicked (event) {
      let files = event.target.files;
      let formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        formData.append('file', file);
      }

      if (!files.length) {
        return;
      }

      $q.loading.show();
      axios
        .post(process.env.BASE_URL+'fileUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        })
        .then(async (response) => {
          let url = response.data.url;
            url = process.env.ROOT_URL+ '/' + url
            uploadedImage.value = url.replace('public/', 'storage/')
        });
      $q.loading.hide();
    }
    async function save(action){
      let payload = {
        'name' : name.value,
        'type' : type.value,
        'url' : uploadedImage.value
      }
      let res = null;
      if (action === 'Add'){
        res = await Api.post('maps',payload);
      }else{
        payload = Object.assign({'id': selectedMap.value},payload)
        res = await Api.put('maps',payload);
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
      name.value = null
      type.value = null
    }
    async function deleteMap(id){
      deleteLoading.value[`deleteLoading-${id}`] =  true
      let res = await Api.delete('maps',{id})
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
      uploadedImage,
      filter,
      loading,
      pagination,
      columns,
      rows,
      action,
      dialog,
      name,
      type,
      price,
      blocks,
      block,
      deleteLoading,
      selectedMap,
      onFilesPicked,
      uploadFile,
      onRequest,
      submit,
      save,
      reset,
      deleteMap
    }
  }
}
</script>
<style lang="sass" scoped>
.my-card
  width: 100px
  height: 100px
  border-radius: 10px
  border: 1px dashed black
  display: flex
  justify-content: center
.section
  display: flex
  justify-content: center
  align-items: center
.close
  right: 0
</style>
