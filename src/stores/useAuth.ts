import { defineStore } from 'pinia';
interface IAuth {
  isAuthenticated: boolean;
}
export const useAuthStore = defineStore('auth', {
  state: ():IAuth => ({
    isAuthenticated: false,
  }),

  getters: {
  },

  actions: {
    changeAuthStatus(status = false){
      this.isAuthenticated =  status;
    }
  }
});
