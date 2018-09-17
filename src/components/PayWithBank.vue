<template>
  <v-card>
    <v-card-text class="pt-4">
    <v-alert v-if="error" outline color="error" icon="warning" :value="error">
        {{error}}
    </v-alert>
    <template v-else-if="success">
        <h3>Transaction was successful</h3>
    </template>
    <template v-else-if="target === 'form'">
        <v-select v-model="selectedBank" :items="bankList" label="Select Bank"></v-select>

        <template v-if="selectedBankObject">
            <template v-if="selectedBankObject.direct">
                <div class="text-xs-center">
                    <v-btn :loading="loading" @click="payWithInternetBanking" round color="primary" dark>Pay with internet banking</v-btn>
                </div>
            </template>
            <template v-else>
                <v-text-field @keyup.enter="pay" v-model="phoneNumber" label="Phone Number"></v-text-field>
                <v-text-field @keyup.enter="pay" v-model="accountNumber" label="Account Number"></v-text-field>
                <div class="text-xs-center">
                    <v-btn :loading="loading" @click="pay" round color="primary" dark>Pay</v-btn>
                </div>
            </template>
        </template>

    </template>

    <template v-else>

            <h3>{{initialResponse.message}}</h3>
            <v-text-field ref="otp" label="OTP" @keyup.enter="verifyOtp" v-model="otp"></v-text-field>
            <div class="text-xs-center">
                <v-btn :loading="loading" @click="verifyOtp" round color="primary" dark>Pay</v-btn>
            </div>
    </template>

    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios';
import Config from '../config';
export default {
  name: 'PayWithUssd',
  watch: {
    selectedBank(value){
      this.banks.forEach((bank) => {
          if (bank.name === value){
              this.selectedBankObject = bank;
          }
      })
    }
  },
  data: function () {
    return {
        bankList: [],
        selectedBank: String,
        loading: false,
        success: false,
        target: 'form',
        selectedBankObject: null,
        phoneNumber: '',
        accountNumber: '',
        initialResponse: Object,
        otp: '',
        directPay: false,
        error: ''
    }
  },

    methods:{
      pay(){
        if (this.selectedBankObject && (this.selectedBankObject.direct || (this.phoneNumber && this.accountNumber))){
            this.loading = true;
            axios.post(Config.baseUrl+Config.chargeBankUrl, {
                account: this.accountNumber,
                direct: !!this.selectedBankObject.direct,
                phone: this.phoneNumber,
                bank:this.selectedBankObject.code,
                amount: this.amount,
                email: this.email,
                ref: this.reference,
                wv: Config.version,
                fingerprint: this.fingerprint
            }).then((response) => {
                this.loading = false
                const data = response.data;
                this.initialResponse = data
                this.loading = false;

                if (data.status === 'success'){
                    if (this.directPay){
                        this.openWindow();
                    } else
                        this.target = data.action;
                }

            }).catch((e) => {
                this.loading = false
            });
        }
      },
      payWithInternetBanking(){
          this.directPay = true;
          this.pay();
      },
      openWindow(){

          const win = window.open(this.initialResponse.url, '_blank');
          win.focus();

//          window.open(this.initialResponse.url, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');


          window.onfocus = ()=> {

              console.log('focused');
          };
         window.onblur = ()=> {

              console.log('onblur');
          };

      },
    verifyOtp(){

    }
    },
    props: {
        pkey: String,
        amount: 0,
        email: String,
        banks: null,
        reference: String,
        fingerprint: String
    },
  mounted(){
    this.bankList = this.banks.map((bank) => bank.name)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
