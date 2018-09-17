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
          <v-icon color="green" x-large>check</v-icon>
          <h3>{{successMessage}}</h3>
        </v-flex>
      </template>
      <template v-else>

        <div class="text-xs-center">
          <v-progress-circular v-if="qrLoading" indeterminate></v-progress-circular>


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
  name: 'PayWithQr',
  data: function () {
    return {
        success: false,
        successMessage: '',
        loading: false,
        amountText: '',
        error: '',
        qrImage: '',
        qrLoading: true,
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

      this.amountText = Utilities.getCommaSeparatedNumber(this.amount.toString());

      axios.post(Config.baseUrl+Config.getQrPath, {
          fingerprint: this.fingerprint,
          ref: this.reference,
          wv: Config.version,
          amount: this.amount
      }).then((response) => {
          const data = response.data;
          this.qrLoading = false;

          if (data.status === 'success'){
              this.qrImage = data.image;
          }

          document.addEventListener('payment_success', function () {
              console.log('payment success');
              this.successMessage = 'Payment was successful';
              window.parent.postMessage({name: 'done', reference: this.reference},'*');

          })
      })



  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
