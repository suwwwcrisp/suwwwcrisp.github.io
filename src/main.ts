import { createApp } from 'vue';
import './styles/theme.css';
import './styles/transitions.css';
import { siteConfig } from './data/siteConfig';
import App from './App.vue';

document.title = siteConfig.profile.siteTitle;

createApp(App).mount('#app');
