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
        <h3>{{successMessage}}</h3>
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
import Fingerprint from 'fingerprintjs2'
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
    reference: String

  },
  mounted(){

      this.amountText = Utilities.getCommaSeparatedNumber(this.amount.toString());

      new Fingerprint().get((result) => {
          axios.post(Config.baseUrl+Config.getQrPath, {
            fingerprint: result,
            ref: this.reference,
            amount: this.amount
          }).then((response) => {
              const data = response.data;
              this.qrLoading = false;

              if (data.status === 'success'){
                this.qrImage = data.image;
              }
          })
      });




  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
