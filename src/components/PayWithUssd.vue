<template>
  <v-card>
    <v-card-text class="pt-4">
    <template v-if="success">
        <h3>Transaction was successful</h3>
    </template>
    <template v-else-if="target === 'form'">
        <v-select v-model="selectedBank" :items="bankList" label="Select Bank"></v-select>
        <v-text-field @keyup.enter="pay" v-model="phoneNumber" label="Phone Number"></v-text-field>
        <v-text-field @keyup.enter="pay" v-if="selectedBankObject && selectedBankObject.getAccountNumber" label="Account Number"></v-text-field>
        <div class="text-xs-center">
            <v-btn :loading="loading" @click="pay" round color="primary" dark>Pay</v-btn>
        </div>
    </template>

    <template v-else>
        <template v-if="selectedBank === 'GT Bank'">
            <h3>Dial *737*50*{{initialResponse.amount}}*159# to complete transaction</h3>

            <h4>Transaction Reference: {{initialResponse.tRef}}</h4>
        </template>
        <template v-else>

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
        amount: 10,
        loading: false,
        success: false,
        target: 'form',
        email: 'jamesthedove@gmail.com',
        selectedBankObject: Object,
        banks: [
            {
                name: 'GT Bank',
                id: '058',
            },
            {
                name: 'Zenith Bank',
                id: '057',
                getAccountNumber: true
            }
        ],
        phoneNumber: '',
        accountNumber: '',
        initialResponse: Object
    }
  },

    methods:{
      pay(){
        if (this.selectedBankObject && this.phoneNumber){
            if (this.selectedBankObject.getAccountNumber && !accountNumber){
                //don't proceed
            } else {

                new Fingerprint().get((result) => {
                    this.loading = true
                    axios.post(Config.baseUrl+Config.chargeUSSDUrl, {
                        account: this.accountNumber || '',
                        phone: this.phoneNumber,
                        bank:this.selectedBankObject.id,
                        amount: this.amount,
                        email: this.email,
                        fingerprint: result
                    }).then((response) => {
                        this.loading = false
                        const data = response.data;
                        this.initialResponse = data
                        this.loading = false

                        if (data.status === 'success' && data.action === 'bank'){
                            this.target = 'bank'
                        }
                    })
                })

            }
        }
      }
    },
    props: {
    msg: String
  },
  mounted(){
    this.bankList = this.banks.map((bank) => bank.name)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
