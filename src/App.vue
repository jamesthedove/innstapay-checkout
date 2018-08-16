<template>
  <v-app>

    <v-container  style=" background-color: rgba(0, 0, 0, 0.6);" fluid fill-height>
      <div v-if="loading" class="text-xs-center">
        <v-progress-circular
                indeterminate
                color="primary"
        ></v-progress-circular>
      </div>
      <v-layout v-else flex align-center justify-center>
        <v-flex xs12 sm6 elevation-6>
          <v-toolbar
                  color="cyan"
                  dark
                  tabs
          >

            <v-toolbar-title>{{merchantName}}</v-toolbar-title>

            <v-spacer></v-spacer>


            <v-tabs
                    slot="extension"
                    v-model="paymentMethod"
                    centered
                    color="cyan"
                    slider-color="yellow"
            >
              <v-tab
                      key="card"
                      href="#tab-card"
              >
               Card
              </v-tab>
              <v-tab
                      key="ussd"
                      href="#tab-ussd"
              >
                USSD
              </v-tab>
            </v-tabs>
          </v-toolbar>

          <v-tabs-items v-model="paymentMethod">
            <v-tab-item
                    id="tab-card"
                    key="card"
            >
              <pay-with-card :email="userEmail" :pkey="merchantPublicKey" :amount="amount"></pay-with-card>
            </v-tab-item>
            <v-tab-item
                    id="tab-ussd"
                    key="ussd"
            >
             <pay-with-ussd :email="userEmail" :pkey="merchantPublicKey" :amount="amount"></pay-with-ussd>
            </v-tab-item>
          </v-tabs-items>
        </v-flex>
      </v-layout>

    </v-container>


  </v-app>
</template>

<script>
import axios from 'axios'
import Config from './config'
import Utilites from './utilities'
import PayWithCard from './components/PayWithCard'
import PayWithUssd from './components/PayWithUssd'

export default {
  name: 'App',
  components: {
      PayWithUssd,
      PayWithCard
  },
  data () {
    return {
      paymentMethod: 'card',
      loading: true,
      merchantName: '',
      merchantLogo: '',
      merchantServices: '',
      amount: 0,
      merchantPublicKey: '',
      userEmail: ''
    }
  },
  methods: {
      pay(){

      }
  },
  mounted(){
    this.merchantPublicKey = Utilites.getParameterByName('k') || 'KDLFkfsdkfjLKJ45839udfasf';
    this.userEmail = Utilites.getParameterByName('e') || 'jamesthedove@gmail.com';
    this.amount = Utilites.getParameterByName('a') || 10
    axios.get(Config.baseUrl+Config.getMerchant,{
        params: {
            k: this.merchantPublicKey,
            a: this.amount
        }
    }).then((response) => {
        const data = response.data;
        if (data.status === 'success'){
            this.merchantName = data.name;
            this.merchantLogo = data.logo;
            this.merchantServices = data.services;
            this.loading = false;
        }


    })
  }
}
</script>

<style>
  body{
    background-color: rgba(0, 0, 0, 0.6);;
  }
</style>
