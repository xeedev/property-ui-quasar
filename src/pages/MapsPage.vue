<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row">
          <q-btn label="Add Map" @click="dialog=true"  color="yellow-7"/>
          <q-space/>
          <q-input
            dense
            outlined
            v-model="search"
            label="Search"
            v-on:change=searchResult
            clearable
          />
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row justify-center flex text-center">
          <template v-for="(row,index) in originalRows" :key="index">
            <div class="col col-lg-2 col-md-6">
              <q-card class="my-card" v-if=" row.type!== 'pdf'" :style="
                'background-image: url(' +
                row.url +
                '); background-size: cover'
              ">
                <q-icon name="close" class="absolute close bg-red-5 border-radius-inherit cursor-pointer" @click="deleteMap(row.id)"></q-icon>
              </q-card>
              <q-card class="my-card" v-else :style="
                'background-image: url(/pdf.png); background-size: cover'
              ">
                <q-icon name="close" class="absolute close bg-red-5 border-radius-inherit cursor-pointer" @click="deleteMap(row.id)"></q-icon>
              </q-card>
            </div>
          </template>
        </div>
      </q-card-section>
    </q-card>

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
            <q-select outlined v-model="type" :options="types" :option-value="(types) => types === null ? null : types.name" label="Update Status" :option-label="(types) => types === null ? null : types.name"/>
            <div class="row q-gutter-md">
              <q-card class="my-card cursor-pointer" @click="$refs.image.click()">
                <q-card-section class="q-ma-none q-pa-none section">
                  <q-icon name="perm_media" class="text-dark" size="xl" />
                </q-card-section>
              </q-card>
              <input
                style="display: none"
                type="file"
                ref="image"
                @change="uploadFile"
              />
                <q-card v-if="!!uploadedImage && type?.name !== 'pdf'" class="my-card" :style="
                'background-image: url(' +
                uploadedImage +
                '); background-size: cover'
              ">
                  <q-icon name="close" class="absolute close bg-red-5 border-radius-inherit cursor-pointer" @click="uploadedImage = ''"></q-icon>
                </q-card>
              <q-card v-if="!!uploadedImage && type?.name === 'pdf'" class="my-card" :style="
                'background-image: url(/pdf.png); background-size: cover'
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

export default {
  setup () {
    const types = ref([
      {
        name: 'pdf',
      },
      {
        name: 'image',
      }
    ])
    const originalRows = ref([])
    const search = ref('')
    const pdf = ref('/pdf')
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
    const action = ref('Add');
    const dialog = ref(false);
    const maps = ref([]);
    const block = ref('');
    async function searchResult(){
      let maps = await Api.getList('maps',{
        'key': ['name','type'],
        'search' : search.value
      });
      originalRows.value = maps.data.data;
    }
    async function submit(val,id = null){
      action.value = val;
      if (val === 'Edit'){
        selectedMap.value = id
        let res = await Api.getOne('maps', {id});
        let maps = res.data.data;
        name.value = maps.name
        uploadedImage.value = maps?.url
        type.value = maps?.type ? types.value.find(obj => obj.name === maps.type) : '';
      }
      dialog.value = true
    }
    onMounted(async () => {
      let maps = await Api.getList('maps',{
        'key': ['name','type'],
        'search' : search.value
      });
      originalRows.value = maps.data.data;
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
        'type' : type.value.name,
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
      uploadedImage.value = null
    }
    async function deleteMap(id){
      deleteLoading.value[`deleteLoading-${id}`] =  true
      let res = await Api.delete('maps',{id})
      if (res.data.success){
        rows.value.splice(id, 1);
      }
      deleteLoading.value[`deleteLoading-${id}`] =  false
    }

    return {
      originalRows,
      uploadedImage,
      filter,
      loading,
      pagination,
      rows,
      action,
      dialog,
      name,
      type,
      price,
      maps,
      block,
      deleteLoading,
      selectedMap,
      types,
      pdf,
      search,
      onFilesPicked,
      uploadFile,
      submit,
      save,
      reset,
      searchResult,
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
