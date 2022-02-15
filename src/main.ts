import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Web3Plugin from '@/services/web3/web3.plugin'
import { Web3Provider } from '@ethersproject/providers'
import VueClickAway from 'vue3-click-away'
import './index.scss'

createApp(App)
    .use(router)
    .use(Web3Plugin, Web3Provider)
    .use(VueClickAway)
    .mount('#app')
