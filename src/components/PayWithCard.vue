<template>
  <v-card>
    <v-card-text class="pt-4">
      <div class="text-xs-center">
        <h3 class="red--text">₦ {{amount}}</h3>
      </div>
      <v-alert v-if="error" outline color="error" icon="warning" :value="error">
        {{error}}
      </v-alert>
      <template v-else-if="success">
        <h3>{{successMessage}}</h3>
      </template>
      <template v-else-if="target === 'card'">



        <div class='card-wrapper'></div>

        <v-form class="pa-3 c-form" ref="form">
          <v-text-field ref="number" placeholder="" id="number" length="16" v-model="number" label="Card Number"></v-text-field>
          <v-layout row>
            <v-text-field ref="expiry" placeholder="MM/YY" xs6 id="expiry" v-model="expiry" label="Expiry"></v-text-field>
            <v-text-field @keyup.enter="pay" ref="cvv" placeholder="111" xs6 id="cvv" class="ml-1" v-model="cvv" label="CVV"></v-text-field>
          </v-layout>

        </v-form>
        <div class="text-xs-center">
          <v-btn :loading="cardLoading" @click="pay" round color="primary" dark>Pay</v-btn>
        </div>
      </template>

      <template v-else>
        <h3><b>{{otpLabel}}</b></h3>
        <v-text-field @keyup.enter="verifyOtp" v-model="otp"></v-text-field>
        <div class="text-xs-center">
          <v-btn :loading="otpLoading" @click="verifyOtp" round color="primary" dark>Pay</v-btn>
        </div>
      </template>


    </v-card-text>
  </v-card>
</template>

<script>
import Fingerprint from 'fingerprintjs2'
import axios from 'axios'
import validator from 'card-validator'
import Config from '../config'
export default {
  name: 'PayWithCard',
  data: function () {
    return {
        number: '',
        cvv: '',
        expiry: '',
        target: 'card',
        otp: '',
        otpLabel: String,
        otpData: Object,
        success: false,
        successMessage: '',
        cardLoading: false,
        otpLoading: false,
        error: '',
        creditCardRules: [
             (value) =>
                validator.number(value).isPotentiallyValid
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
          if (this.otp){
              this.otpData.value = this.otp;
              this.otpLoading = true
              axios.post(Config.baseUrl+Config.continueUrl,this.otpData).then((response) => {
                  const data = response.data;
                  this.otpLoading = false

                  if (data.status === 'success' && data.action === 'done'){
                      this.successMessage = data.message;
                      this.success = true;
                  }
              }).catch((r) => {
                  this.otpLoading = false;
                  const response = r.data;

                  if (response.status === 'error'){
                      this.error = response.message;
                  }
              })
          }

      },
      pay(){
          if (this.$refs.form.validate()) {
              new Fingerprint().get((result) => {

                  const a = this.expiry.split('/');
                  const month = a[0].replace(/\s/g, '')
                  const year = a[1].replace(/\s/g, '')

                  this.cardLoading = true
                  axios.post(Config.baseUrl+Config.chargeUrl, {
                      no: this.number.replace(/\s/g, ''),
                      cvv: this.cvv,
                      month: month,
                      year: year,
                      ref: this.reference,
                      amount: this.amount,
                      email: this.email,
                      merchantPKey: this.pkey,
                      fingerprint: result
                  }).then((response) => {
                      const data = response.data;
                      if (data.status === 'success'){
                          if (data.action === 'otp' || data.action === 'pin'){
                              this.otpLabel = data.message;
                              this.otpData = {
                                  ref: data.ref,
                                  action: data.action
                              }
                              this.target = 'otp';
                          } else if(data.action === 'done'){
                              this.successMessage = data.message;
                              this.success = true;
                          }
                      } else if(data.status === 'error') {
                          this.error = data.message;
                      }


                  }).catch((e) => {
                      this.cardLoading = false
                  })
              })
          }


      }
    },
    props: {
    pkey: String,
    amount: 0,
    email: String,
    reference: String

  },
  mounted(){
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
              name: 'Name',
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
