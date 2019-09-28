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
        <v-flex transition="slide-y-transition" class="text-xs-center">
            <v-icon color="green" x-large>check</v-icon>
            <h3>{{successMessage}}</h3>
        </v-flex>
    </template>
      <template v-else-if="transferNote">
        <p><b>Please proceed to your mobile banking/internet banking app to complete your bank transfer payment to {{accountName}}</b></p>
      <div class="text-xs-center">
          <v-layout  row>
              <v-flex xs6>
                  <h3>Amount</h3>
              </v-flex>
              <v-flex xs6>
                  <h3>₦ {{amountText}}</h3>
              </v-flex>
          </v-layout>
          <hr/>
          <v-layout  row>
              <v-flex xs6>
                  <h3>Account Name</h3>
              </v-flex>
              <v-flex xs6>
                  <h3>{{accountName}}</h3>
              </v-flex>
          </v-layout>
          <hr/>
          <v-layout  row>
              <v-flex xs6>
                  <h3>Account Number</h3>
              </v-flex>
              <v-flex xs6>
                  <h3>{{accountNumber}}</h3>
              </v-flex>
          </v-layout>
          <hr/>
          <v-layout row>
              <v-flex xs6>
                  <h3>Account Bank</h3>
              </v-flex>
              <v-flex xs6>
                  <h3>{{accountBank}}</h3>
              </v-flex>
          </v-layout>
      </div>


          <p class="mt-5">Once The Payment is received, this transaction will automatically completed and this page will close. Please note that depending on your bank, the transaction might take up to 5 minutes or more to complete</p>
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
        transferNote: '',
        successMessage: '',
        loading: false,
        amountText: '',
        error: '',
        accountNumber: '',
        accountBank: '',
        accountName: '',
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
                  this.transferNote = data.note;
                  this.accountNumber = data.account;
                  this.accountBank = data.bank;
                  const index = data.note.indexOf("to");
                  this.accountName = data.note.substring(index + 3, data.note.length)
              }

              document.addEventListener('payment_success',  () => {
                  console.log('payment success');
                  this.success = true;
                  this.successMessage = 'Payment was successful';
                  window.parent.postMessage({name: 'done', reference: this.reference},'*');

              })
          })
      })



  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
