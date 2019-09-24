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

      <template v-else-if="successMessage">
        <v-flex class="text-xs-center">
          <v-icon color="green" x-large>info</v-icon>
          <h3>{{successMessage}}</h3>
          <h3>Account Number: {{accountNumber}}</h3>
          <h3>Account Bank: {{accountBank}}</h3>
          <p>Once The Payment is made successfully, the transaction will be completed.</p>
        </v-flex>
      </template>
      <template v-else>

        <div class="text-xs-center">
          <v-progress-circular v-if="bankTransferLoading" indeterminate></v-progress-circular>


        </div>

        <div class="text-xs-center">
          <img width="200px" height="300px" v-if="qrImage" :src="qrImage"/>
        </div>
      </template>


    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios'
import Config from '../config'
import Utilities from '../utilities';
export default {
  name: 'PayWithBankTransfer',
  data: function () {
    return {
        success: false,
        successMessage: '',
        loading: false,
        amountText: '',
        error: '',
        accountNumber: '',
        accountBank: '',
        bankTransferLoading: true,
    }
  },

    methods:{

    },
    props: {
      pkey: String,
      amount: 0,
      email: String,
      reference: String,
      fingerprint: String

    },
  mounted(){

      console.log("amount", this.amount)

      this.amountText = Utilities.getCommaSeparatedNumber(this.amount.toString());

      document.addEventListener("getBankTransferAccount", () => {
          axios.post(Config.baseUrl+Config.getBankTransferAccount, {
              fingerprint: this.fingerprint,
              ref: this.reference,
              wv: Config.version,
              amount: this.amount
          }).then((response) => {
              const data = response.data;
              this.bankTransferLoading = false;

              if (data.status === 'success'){
                  this.successMessage = data.note;
                  this.accountNumber = data.account;
                  this.accountBank = data.bank;
              }

              document.addEventListener('payment_success',  () => {
                  console.log('payment success');
                  this.successMessage = 'Payment was successful';
                  window.parent.postMessage({name: 'done', reference: this.reference},'*');

              })
          })
      })



  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
