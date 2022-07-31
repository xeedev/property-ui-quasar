import axios from 'axios';

const csrfToken = document.head.querySelector('meta[name="csrf-token"]');
const debug = process.env.NODE_ENV !== 'production';
const wsClient = axios.create({ baseURL: process.env.BASE_URL });

class http {
    client = wsClient;
    reqCount = 0;
    silentCount = 0;

    constructor(app = 'ws') {
        this.setClient(app, false);
        this.reqCount = typeof this.reqCount == 'undefined' ? 0 : this.reqCount;
        this.silentCount = typeof this.silentCount == 'undefined' ? 0 : this.silentCount;
    }

    async get(url, payload, app = 'ws') {
        this.setClient(app);
        try {
            let pl = this.transformRequest(payload, null, true);
            return await this.client.get(url, {
                params: pl,
                transformResponse: [this.transformResponse],
            });
        } catch(error) {
            return error.response;
        }
    }


    async post(url, payload, app = 'ws') {
        this.setClient(app);
        try {
            return await this.client.post(url, payload, {
                transformRequest: [this.transformRequest],
                transformResponse: [this.transformResponse],
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress,
            });
        } catch(error) {
            return error.response;
        }
    }

    async put(url, payload, app = 'ws') {
        this.setClient(app);
        try {
            return await this.client.put(url, payload, {
                transformRequest: [this.transformRequest],
                transformResponse: [this.transformResponse],
                onUploadProgress: uploadProgress,
                onDownloadProgress: downloadProgress,
            });
        } catch(error) {
            return error.response;
        }
    }

    async delete(url, payload, app = 'ws') {
        this.setClient(app);
        try {
            return await this.client.delete(url, payload);
        } catch(error) {
            return error.response;
        }
    }

    setClient(app, addInterceptors = true) {
        switch(app) {
            case 'ws':
            default:
                this.client = wsClient;
                if(addInterceptors) {
                    wsClient.interceptors.request.use( successRequestHandler, errorRequestHandler );
                    wsClient.interceptors.response.use( successResponseHandler, errorResponseHandler);
                }
                return;
        }
    }

    transformRequest = (data, headers, ext = false) => {
        if(data.hasOwnProperty('wsforceload')) delete data.wsforceload;
        if(data.hasOwnProperty('wssilent')) {
            this.silentCount++;
            delete data.wssilent;
        } else this.reqCount++;

        if(data.hasOwnProperty('wsoverlay')) {
            delete data.wsoverlay;
        }

        if(data.hasOwnProperty('wsupload')) {
            if(headers)  headers.post['Content-Type'] = 'multipart/form-data';
            delete data.wsupload;
        }


        if( ext ) return data;
        else return JSON.stringify(data);
    };

    transformResponse = (data) => {
        if(!data.hasOwnProperty('wssilent')) this.reqCount--;
        return JSON.parse(data);
    };
}

/** transformers **/

const uploadProgress = (progressEvent) => {
    console.log(progressEvent);
};

const downloadProgress = (progressEvent) => {
    console.log(progressEvent);
};

/** axios interceptors **/

const successRequestHandler = request => {
    request.headers.common.Accept = 'application/json';
    request.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    request.headers.common['Content-Type'] = 'application/json';
    request.headers.post['Content-Type'] = 'application/json';
    request.headers.put['Content-Type'] = 'application/json';
    request.headers.patch['Content-Type'] = 'application/json';
    if (csrfToken) request.headers.common['X-CSRF-TOKEN'] = csrfToken.content;
    if (localStorage.getItem('token')) request.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return request;
};

const errorRequestHandler = error => {
    if (debug) { console.info('✉ REQ_ERR ', error); }
    return Promise.reject({ ...error });
};


const successResponseHandler = response => response;

const errorResponseHandler = async error => {
    switch(error.response.status) {
        case 401:
            break;
        case 422:
        default:
            break;
    }
    if (error.response && error.response.data && debug) {
        console.info('✉ RES_ERR ', error.response.data.message);
    } else if(error.response && debug) console.info('✉ RES_ERR ', error.response);
    return Promise.reject({ ...error });
};

export default new http();
