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
        <v-text-field @keyup.enter="pay" v-model="phoneNumber" label="Phone Number"></v-text-field>
        <v-text-field @keyup.enter="pay" v-model="accountNumber" label="Account Number"></v-text-field>
        <div class="text-xs-center">
            <v-btn :loading="loading" @click="pay" round color="primary" dark>Pay</v-btn>
        </div>
    </template>

    <template v-else>
        <template>
            <h3>{{initialResponse.message}}</h3>

        </template>
    </template>

    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios';
import Fingerprint from 'fingerprintjs2'
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
        error: ''
    }
  },

    methods:{
      pay(){
        if (this.selectedBankObject && this.phoneNumber && this.accountNumber){
            new Fingerprint().get((result) => {
                this.loading = true
                axios.post(Config.baseUrl+Config.chargeBankUrl, {
                    account: this.accountNumber,
                    phone: this.phoneNumber,
                    bank:this.selectedBankObject.code,
                    amount: this.amount,
                    email: this.email,
                    ref: this.reference,
                    fingerprint: result
                }).then((response) => {
                    this.loading = false
                    const data = response.data;
                    this.initialResponse = data
                    this.loading = false

                    if (data.status === 'success' && data.action === 'bank'){
                        this.target = 'bank'
                    }
                }).catch((e) => {
                    this.loading = false
                })
            })
        }
      }
    },
    props: {
        pkey: String,
        amount: 0,
        email: String,
        banks: [],
        reference: String
  },
  mounted(){
    this.bankList = this.banks.map((bank) => bank.name)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
