<template>
  <v-app :style="inline ? 'background: none' : ''">

    <v-container fluid fill-height>
      <v-layout class="text-xs-center" v-if="loading" flex align-center justify-center>
        <div class="lds-css ng-scope"><div style="width:100%;height:100%" class="lds-double-ring"><div></div><div></div></div></div>
      </v-layout>
      <v-layout v-else flex align-center justify-center>
        <v-flex xs12 sm6 elevation-6>
          <v-toolbar
                  color="primary"
                  dark
                  tabs
          >

            <v-toolbar-title>{{merchantName}}</v-toolbar-title>

            <v-spacer></v-spacer>
            <v-btn icon @click="closeDialog">
              <v-icon>close</v-icon>
            </v-btn>


            <v-tabs
                    slot="extension"
                    v-model="paymentMethod"
                    centered
                    color="primary"
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
                BANK
              </v-tab>
            </v-tabs>
          </v-toolbar>

          <v-tabs-items v-model="paymentMethod">
            <v-tab-item
                    id="tab-card"
                    key="card"
            >
              <pay-with-card :reference="reference" :email="userEmail" :pkey="merchantPublicKey" :amount="amount"></pay-with-card>
            </v-tab-item>
            <v-tab-item
                    id="tab-ussd"
                    key="ussd"
            >
             <pay-with-ussd :reference="reference" :banks="banks" :email="userEmail" :pkey="merchantPublicKey" :amount="amount"></pay-with-ussd>
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
      userEmail: '',
      banks: [],
      reference: '',
      id: '',
      inline: true
    }
  },
  methods: {
      pay(){

      },
      closeDialog(){
          window.parent.postMessage('close','*');
      }
  },
  mounted(){
    this.id = Utilites.getParameterByName('i');
    this.merchantPublicKey = Utilites.getParameterByName('k');
    this.userEmail = Utilites.getParameterByName('e');
    this.amount = Utilites.getParameterByName('a');
    this.inline = !this.id;
    axios.get(Config.baseUrl+Config.initialiseTransactionUrl,{
        params: {
            k: this.merchantPublicKey,
            a: this.amount,
            e: this.userEmail,
            id: this.id
        }
    }).then((response) => {
        const data = response.data;
        if (data.status === 'success'){
            if (data.amount){
                this.amount = parseInt(data.amount);
            }
            this.merchantName = data.name;
            this.merchantLogo = data.logo;
            this.merchantServices = data.services;
            this.banks = data.banks;
            this.loading = false;
            this.reference = data.ref;
        }


    })
  }
}
</script>

<style>
  @keyframes lds-double-ring {
    0% {
      -webkit-transform: rotate(0);
      transform: rotate(0);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @-webkit-keyframes lds-double-ring {
    0% {
      -webkit-transform: rotate(0);
      transform: rotate(0);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes lds-double-ring_reverse {
    0% {
      -webkit-transform: rotate(0);
      transform: rotate(0);
    }
    100% {
      -webkit-transform: rotate(-360deg);
      transform: rotate(-360deg);
    }
  }
  @-webkit-keyframes lds-double-ring_reverse {
    0% {
      -webkit-transform: rotate(0);
      transform: rotate(0);
    }
    100% {
      -webkit-transform: rotate(-360deg);
      transform: rotate(-360deg);
    }
  }
  .lds-double-ring {
    position: relative;
  }
  .lds-double-ring div {
    position: absolute;
    width: 160px;
    height: 160px;
    top: 20px;
    left: 20px;
    border-radius: 50%;
    border: 8px solid #000;
    border-color: #bd4030 transparent #bd4030 transparent;
    -webkit-animation: lds-double-ring 1s linear infinite;
    animation: lds-double-ring 1s linear infinite;
  }
  .lds-double-ring div:nth-child(2) {
    width: 140px;
    height: 140px;
    top: 30px;
    left: 30px;
    border-color: transparent #e0b83e transparent #e0b83e;
    -webkit-animation: lds-double-ring_reverse 1s linear infinite;
    animation: lds-double-ring_reverse 1s linear infinite;
  }
  .lds-double-ring {
    width: 65px !important;
    height: 65px !important;
    -webkit-transform: translate(-32.5px, -32.5px) scale(0.325) translate(32.5px, 32.5px);
    transform: translate(-32.5px, -32.5px) scale(0.325) translate(32.5px, 32.5px);
  }
</style>
