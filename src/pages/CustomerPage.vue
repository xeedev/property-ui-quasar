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
        <q-btn color="yellow-7" icon="add" :disable="loading" :label="$q.screen.xs || $q.screen.sm ? '' : 'Add Customer'" @click="submit('Add')" />
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
            <q-btn size="sm" color="red" :key="props.row.id" :loading="deleteLoading[`deleteLoading-${props.row.id}`]" round dense icon="delete" @click="deleteCustomer(props.row.id)" />
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
          <div class="text-h6 text-dark">{{action}} Customer</div>
        </q-card-section>

        <q-card-section>
          <q-form
            @submit="save(action)"
            class="q-gutter-md"
          >
            <q-input
              outlined
              v-model="name"
              label="Customer Name *"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please add Customer Name']"
            />

            <q-input
              outlined
              v-model="contact"
              type="number"
              label="Customer Contact"
            />

            <q-input
              outlined
              v-model="email"
              label="Customer Email"
              type="email"
            />

            <q-input
              outlined
              v-model="notes"
              label="Notes"
              hint="Notes"
              type="textarea"
            />
            <div>
              <q-btn :label="action === 'Edit' ? 'Update Customer' : 'Add Customer'" type="submit" color="yellow-7"/>
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
  { name: 'contact', align: 'left', label: 'Contact', field: 'contact', sortable: true, format: val => val ? val.substring(0,100) : 'N/A'},
  { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true, format: val => val ? val.substring(0,100) : 'N/A'},
  { name: 'notes', align: 'left', label: 'Notes', field: 'notes', sortable: true, format: val => val ? val.substring(0,100) : 'N/A'},
]

const originalRows = ref([])

export default {
  setup () {
    const deleteLoading = ref({})
    const $q = useQuasar()
    const selectedCustomer = ref('')
    const name = ref('')
    const notes = ref('')
    const contact = ref('')
    const email = ref('')
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
    const customers = ref([]);
    const customer = ref('');
    const uploadedImages = ref([])
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
      let customers = await Api.getList('users');
      originalRows.value = customers.data.data;
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
        selectedCustomer.value = id
        let res = await Api.getOne('users', {id});
        let customer = res.data.data;
        name.value = customer.name
        notes.value = customer.notes
        contact.value = customer.contact
        email.value = customer.email
      }
      dialog.value = true
    }
    onMounted(async () => {
      onRequest({
        pagination: pagination.value,
        filter: undefined
      })
    })
    async function save(action){
      let payload = {
        'name' : name.value,
        'notes' : notes.value,
        'contact' : contact.value,
        'email' : email.value,
      }
      let res = null;
      if (action === 'Add'){
        res = await Api.post('users',payload);
      }else{
        payload = Object.assign({'id': selectedCustomer.value},payload)
        res = await Api.put('users',payload);
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
      notes.value = null
      contact.value = null
      email.value = null
    }
    async function deleteCustomer(id){
      deleteLoading.value[`deleteLoading-${id}`] =  true
      let res = await Api.delete('users',{id})
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
      filter,
      loading,
      pagination,
      columns,
      rows,
      action,
      dialog,
      name,
      notes,
      contact,
      email,
      price,
      customers,
      customer,
      uploadedImages,
      deleteLoading,
      selectedCustomer,
      onRequest,
      submit,
      save,
      reset,
      deleteCustomer
    }
  }
}
</script>
