import Vue from 'vue'

import {
  Vuetify,
  VApp,
  VNavigationDrawer,
  VFooter,
  VList,
  VBtn,
  VIcon,
  VGrid,
  VToolbar,
  VTextField,
  VForm,
  VCard,
  VBottomNav,
  VTabs,
  VSelect,
  VAlert,
  VProgressCircular,
  transitions
} from 'vuetify'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  components: {
    VApp,
    VNavigationDrawer,
    VProgressCircular,
    VFooter,
    VList,
    VBtn,
    VIcon,
    VGrid,
    VToolbar,
    VForm,
    VCard,
    VTabs,
    VTextField,
    VBottomNav,
    VSelect,
    VAlert,
    transitions
  },
  theme: {
      primary: '#00bcd4',
  }

})
