<template>
  <v-card>
    <v-card-text class="pt-4">
      <div class="text-xs-center">
        <h3 class="red--text">₦ {{amountText}}</h3>
      </div>
      <template v-if="error">
        <v-alert outline color="error" icon="warning" :value="error">
          {{error}}
        </v-alert>
        <div class="text-xs-center">
          <v-btn @click="error = ''" flat color="primary" dark>Try Again</v-btn>
        </div>
      </template>

      <template v-else-if="success">
        <v-flex class="text-xs-center">
          <v-icon color="green" x-large>check</v-icon>
          <h3>{{successMessage}}</h3>
        </v-flex>
      </template>
      <template v-else-if="target === 'card'">

        <div class='card-wrapper'></div>

        <v-form class="pa-3 c-form" ref="form">
          <v-text-field :rules="creditCardRules" ref="number" placeholder="" id="number" length="16" v-model="number" label="Card Number"></v-text-field>
          <v-layout row>
            <v-text-field ref="expiry" placeholder="MM/YY" xs6 id="expiry" v-model="expiry" label="Expiry"></v-text-field>
            <v-text-field @keyup.enter="pay" ref="cvv" placeholder="111" xs6 id="cvv" class="ml-1" v-model="cvv" label="CVV"></v-text-field>
          </v-layout>

        </v-form>
        <div class="text-xs-center">
          <v-btn :loading="loading" @click="pay" round color="primary" dark>Pay</v-btn>
        </div>
      </template>

      <template v-else>
        <h3><b>{{otpLabel}}</b></h3>
        <v-text-field ref="otp" :label="otpHint" @keyup.enter="verifyOtp" v-model="otp"></v-text-field>
        <div class="text-xs-center">
          <v-btn :loading="otpLoading" @click="verifyOtp" round color="primary" dark>Pay</v-btn>
        </div>
      </template>


    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios'
import cryptico from 'cryptico';
import validator from 'card-validator'
import Config from '../config'
import Utilities from '../utilities';
export default {
  name: 'PayWithCard',
  data: function () {
    return {
        number: '',
        cvv: '',
        expiry: '',
        target: 'card',
        otpHint: 'OTP',
        otp: '', // represents either the card pin or otp
        otpLabel: String,
        otpData: Object,
        success: false,
        successMessage: '',
        loading: false,
        otpLoading: false,
        amountText: '',
        error: '',
        creditCardRules: [
             (value) =>
                !!validator.number(value).isPotentiallyValid || 'Invalid Card'
        ]
    }
  },
    watch: {
        number(value){
            if (value.length === 16 + 3){
                this.$refs.expiry.focus()
            }
        },
        expiry(value){
            if (value.length === 7){
                this.$refs.cvv.focus()
            }
        }
    },

    methods:{
      verifyOtp(){
          if (this.otpData.action === 'pin'){
            this.pay();
          } else if (this.otp){
              this.otpData.value = this.otp;
              this.otpData.fingerprint = this.fingerprint;
              this.otpLoading = true;
              axios.post(Config.baseUrl+Config.continueUrl,this.otpData).then((response) => {
                  const data = response.data;
                  this.otpLoading = false;

                  if (data.status === 'success' && data.action === 'done'){
                      this.successMessage = data.message;
                      this.success = true;
                      window.transactionCompleted = true;
                      window.parent.postMessage({name: 'done', reference: this.reference},'*');

                  }
              }).catch((e) => {
                  this.otpLoading = false;
                  const response = e.response.data;

                  if (response.status === 'error'){
                      this.error = response.message;
                  }
              })
          }

      },
      pay(){
          // if the pin was requested dont validate form, just send the pin in the request
          if (((this.otp && this.otpData) || this.$refs.form.validate()) && !this.loading) {
              const a = this.expiry.split('/');
              const month = a[0].replace(/\s/g, '');
              const year = a[1].replace(/\s/g, '');

              const payload = {
                  no: this.number.replace(/\s/g, ''),
                  cvv: this.cvv,
                  month: month,
                  year: year,
                  ref: this.reference,
                  amount: this.amount,
                  email: this.email,
                  merchantPKey: this.pkey,
                  fingerprint: this.fingerprint
              };
              if (this.otp && this.otpData && this.otpData.action === 'pin'){
                  // This means the pin was requested in the initial request
                  payload.pin = this.otp;
              }
              const encryptedPayload = cryptico.encrypt(JSON.stringify(payload), Config.publicKey).cipher;

              axios.post(Config.baseUrl+Config.chargeUrl, {payload: encryptedPayload} ).then((response) => {
                  const data = response.data;
                  if (data.status === 'success'){
                      if (data.action === 'otp' || data.action === 'pin'){
                          this.otpLabel = data.message;
                          this.otpHint =  data.action === 'pin' ? 'Card pin' : 'OTP';
                          this.otpData = {
                              ref: data.ref,
                              action: data.action
                          };
                          this.target = 'otp'; //otp can either by PIN or OTP
                          this.$refs.otp.focus()
                      } else if(data.action === 'done'){
                          this.successMessage = data.message;
                          this.success = true;

                          window.parent.postMessage({name: 'done', reference: this.reference},'*');

                      }
                  } else if(data.status === 'error') {
                      this.error = data.message;
                  }


              }).catch((e) => {
                  this.loading = false

                  const response = e.response.data;

                  if (!response.status){
                      this.error = response.message;
                  }
              });
          }


      }
    },
    props: {
    pkey: String,
    amount: 0,
    email: String,
    reference: String,
    fingerprint: String

  },
  mounted(){

      this.amountText = Utilities.getCommaSeparatedNumber(this.amount.toString());

      new Card({
          // a selector or DOM element for the form where users will
          // be entering their information
          form: '.c-form', // *required*
          // a selector or DOM element for the container
          // where you want the card to appear
          container: '.card-wrapper', // *required*

          formSelectors: {
              numberInput: '#number', // optional — default input[name="number"]
              expiryInput: '#expiry', // optional — default input[name="expiry"]
              cvcInput: '#cvv', // optional — default input[name="cvc"],
          },

//          width: 200, // optional — default 350px
          formatting: true, // optional - default true

          // Strings for translation - optional
          messages: {
              validDate: 'valid\ndate', // optional - default 'valid\nthru'
              monthYear: 'mm/yyyy', // optional - default 'month/year'
          },

          // Default placeholders for rendered fields - optional
          placeholders: {
              name: '',
              expiry: '••/••',
              cvc: '•••'
          },

//          masks: {
//              cardNumber: '•' // optional - mask card number
//          },

          // if true, will log helpful messages for setting up Card
          debug: false // optional - default false
      });
      this.$refs.number.focus()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
