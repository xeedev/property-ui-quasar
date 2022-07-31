import http from '../http'

const routes = {
    'ws': {
        'User': 'users',
        'Location': 'locations',
        'Hotel': 'hotels',
        'Vendor': 'vendors',
        'Organization': 'organizations',
        'Account': 'accounts',
        'Request': 'requests',
        'Message': 'messages',
        'MessageNotification': 'message-notifications',
        'OrganizationUser': 'organization-user',
        'ChangePassword': 'change-password',
        'Plan':'plans',
        'Coupon':'coupons',
        'Subscription':'subscriptions',
        'Invoice': 'invoices',
        'proformaPdf': 'pro-forma-invoice',
        'CreateSession': 'create-session',
        'forgotPassword':'forgot-password',
        'draftVendors' : 'draft-vendors-list',
        'products' : 'products',
        'validateToken' : 'validate-token',
        'statistics' : 'statistics',
        'categories' : 'categories',
        'orders' : 'orders',
        'gallery' : 'gallery',
        'image-upload' : 'imageUpload',
        'logout' : 'logout',
        'general-query':'general-query',
        'order-now':'orders'
    },
};

class Api {

    async login(credentials) {
        return await http.post('/login', credentials, 'ws');
    }

    async signup(credentials) {
        return await http.post('/register', credentials, 'ws');
    }

    async logout(payload) {
        return await http.post('/logout', payload, 'ws');
    }

    async forgotPassword( payload ){
        return await http.post('/forgot-password', payload, 'ws');
    }

    async confirmPassword(password) {
        return await http.post('/confirm-password', password, 'ws');
    }

    async getList( module = '', payload = {}, app = 'ws' ) {
        let route = routes[app][module];
        if(route) return await http.get(`/${route}`, payload, app);
        else {
            console.log('No route found');
            return false;
        }
    }
    async getOne( module = '', payload = {}, app = 'ws' ) {
        if(!payload.hasOwnProperty('id')) {
            console.log('No id found');
            return false;
        }
        let id = payload.id;
        delete payload.id;
        let route = routes[app][module];
        if(route) return await http.get(`/${route}/${id}`, payload, app);
        else {
            console.log('No route found');
            return false;
        }
    }
    async get( module = null, payload = {}, app = 'ws' ) {
        let route = routes[app][module];
        let id = 1;
        if(route) return await http.get(`/${route}/${id}`, payload, app);
        else {
            console.log('No route found');
            return false;
        }
    }
    async post( module = '', payload = {}, app = 'ws' ) {
        let route = routes[app][module];
        if(route) return await http.post(`/${route}`, payload, app);
        else {
            console.log('No route found');
            return false;
        }
    }
    async put( module = null, payload = {}, app = 'ws' ) {
        if(!payload.hasOwnProperty('id')) {
            console.log('No id found');
            return false;
        }
        let route = routes[app][module];
        if(route) return http.put(`/${route}/${payload.id}`, payload, app);
        else {
            console.log('No route found');
            return false;
        }
    }
    async delete( module = null, payload = {}, app = 'ws' ) {
        if(!payload.hasOwnProperty('id')) {
            console.log('No id found');
            return false;
        }
        let route = routes[app][module];
        if(route) return http.delete(`/${route}/${payload.id}`, payload, app);
        else {
            console.log('No route found');
            return false;
        }
    }

    // async getPdf(module = null, payload = {}, app = 'ws' ){
    //     let route = routes[app][module];
    //     if(route) return await http.get(`/${route}`, payload, app);
    // }
    // async resendPasswordResetMail(module = null, payload = {}, app = 'ws' ){
    //     let route = routes[app][module];
    //     if(route) return await http.post(`/${route}`, payload, app);
    // }
    // async getDraftVendors(module = null, payload = {}, app = 'ws'){
    //     let route = routes[app][module];
    //     if(route) return await http.get(`/${route}`, payload, app);
    // }
}

export default new Api()
