<template>
  <v-app :style="inline ? 'background: none' : ''">

    <v-container fluid fill-height>
      <v-layout class="text-xs-center" v-if="loading" flex align-center justify-center>

        <svg class="lds-message" width="200px"  height="200px"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style="background: none;"><g transform="translate(20 50)">
          <circle cx="0" cy="0" r="6" fill="#4658ac" transform="scale(0.751592 0.751592)">
            <animateTransform attributeName="transform" type="scale" begin="-0.375s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
          </circle>
        </g><g transform="translate(40 50)">
          <circle cx="0" cy="0" r="6" fill="#e7008a" transform="scale(0.399418 0.399418)">
            <animateTransform attributeName="transform" type="scale" begin="-0.25s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
          </circle>
        </g><g transform="translate(60 50)">
          <circle cx="0" cy="0" r="6" fill="#ff003a" transform="scale(0.096539 0.096539)">
            <animateTransform attributeName="transform" type="scale" begin="-0.125s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
          </circle>
        </g><g transform="translate(80 50)">
          <circle cx="0" cy="0" r="6" fill="#ff6d00" transform="scale(0.0153179 0.0153179)">
            <animateTransform attributeName="transform" type="scale" begin="0s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
          </circle>
        </g></svg>

      </v-layout>
      <template v-else-if="error">
          <v-alert outline color="error" icon="warning" :value="error">
            {{error}}
          </v-alert>
        <div v-if="inline" class="text-xs-center">
          <v-btn @click="justCloseDialog">Close</v-btn>
        </div>
      </template>
      <v-layout v-else flex align-center justify-center>
        <v-flex xs12 sm6 elevation-6>
          <v-toolbar
                  color="primary"
                  dark
                  tabs
          >

            <v-toolbar-title>{{merchantName}}</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-progress-circular v-if="closing"
                    indeterminate
                    color="red"
            ></v-progress-circular>

            <v-btn v-else icon @click="closeDialog">
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
                      v-if="merchantServices.indexOf('card') > -1"
                      key="card"
                      href="#tab-card"
              >
               Card
              </v-tab>
              <v-tab
                      v-if="merchantServices.indexOf('bank') > -1"
                      key="ussd"
                      href="#tab-ussd"
              >
                Bank
              </v-tab>
              <v-tab
                      v-if="merchantServices.indexOf('qr') > -1"
                      key="qr"
                      href="#tab-qr"
              >
                Qr
              </v-tab>
            </v-tabs>
          </v-toolbar>

          <v-tabs-items v-model="paymentMethod">
            <v-tab-item
                    id="tab-card"
                    key="card"
            >
              <pay-with-card :fingerprint="fingerprint" :reference="reference" :email="userEmail" :pkey="merchantPublicKey" :amount="amount"></pay-with-card>
            </v-tab-item>
            <v-tab-item
                    id="tab-ussd"
                    key="ussd"
            >
             <pay-with-bank :fingerprint="fingerprint" :reference="reference" :banks="banks" :email="userEmail" :pkey="merchantPublicKey" :amount="amount"></pay-with-bank>
            </v-tab-item>
            <v-tab-item
                    id="tab-qr"
                    key="qr"
            >
              <pay-with-qr :fingerprint="fingerprint" :reference="reference" :email="userEmail" :pkey="merchantPublicKey" :amount="amount"></pay-with-qr>
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
import Pusher from 'pusher-js';
import PayWithCard from './components/PayWithCard'
import PayWithBank from './components/PayWithBank'
import Fingerprint from 'fingerprintjs2'
import PayWithQr from "./components/PayWithQr";

export default {
  name: 'App',
  components: {
      PayWithQr,
      PayWithBank,
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
      error: '',
      fingerprint: '',
      inline: true,
      closing: false
    }
  },
  methods: {
      pay(){

      },
      justCloseDialog(){
        window.parent.postMessage({name: 'close', reference: this.reference},'*');
      },
      closeDialog(){
          if (!window.transactionCompleted){
              this.closing = true;
              axios.post(Config.baseUrl + Config.cancelTransactionUrl, {
                  ref: this.reference,
                  fingerprint: this.fingerprint
              }).then((response) => {
                  console.log(response);
                  window.parent.postMessage({name: 'close', reference: this.reference},'*');
              }).catch((e) => {
                  console.error(e);
                  window.parent.postMessage({name: 'close', reference: this.reference},'*');
              });
          } else {
              window.parent.postMessage({name: 'done'},'*');
          }

      },
      initialiseWebSocket(){
          // Enable pusher logging - don't include this in production
          Pusher.logToConsole = true;

          const pusher = new Pusher(process.env.VUE_APP_PUSHER_KEY, {
              cluster: 'us2',
              forceTLS: true
          });

          const channel = pusher.subscribe(`${this.reference}-channel`);
          channel.bind('payment_success', function(data) {
              const event = new Event('payment_success');
              document.dispatchEvent(event);
          });
      }
  },
  mounted(){
    this.id = Utilites.getParameterByName('i');
    this.merchantPublicKey = Utilites.getParameterByName('k');
    this.userEmail = Utilites.getParameterByName('e');
    this.amount = Utilites.getParameterByName('a');
    this.inline = !this.id;

      new Fingerprint().get((result) => {
          this.fingerprint = result;
          axios.get(Config.baseUrl+Config.initialiseTransactionUrl,{
              params: {
                  k: this.merchantPublicKey,
                  a: this.amount || 100,
                  e: this.userEmail,
                  id: this.id,
                  f: result,
                  wv: Config.version
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

                  this.initialiseWebSocket();

              }


          }).catch((e) => {
              console.error(e);
              this.loading = false;
              if (e.response){
                  if (!e.response.status){
                      // network error
                      //TODO retry
                      this.error = 'A network error occurred. Please Try refreshing the page.';
                  } else {
                      const response = e.response.data;
                      this.error = response.message;
                  }
              }


          })
      })

  }
}
</script>

<style>

</style>
