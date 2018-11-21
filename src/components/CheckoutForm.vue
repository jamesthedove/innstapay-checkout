<template>
  <v-card>
    <v-card-text class="pt-4">
      <div class="text-xs-center">
        <h3 class="red--text">₦ {{amountText}}</h3>
      </div>


        <v-form class="pa-3 c-form" ref="form">
          <v-text-field :rules="emailRules" name="email" type="email" v-model="email" label="Email Address"></v-text-field>
          <v-layout row>
            <v-text-field :rules="nameRules" xs6 v-model="firstName" name="firstName" label="First Name"></v-text-field>
            <v-text-field :rules="nameRules" xs6 v-model="lastName" name="lastName" class="pl-2" label="Last Name"></v-text-field>
          </v-layout>

          <v-text-field :rules="phoneRules" name="phone" type="phone" v-model="phone" label="Phone"></v-text-field>


        </v-form>
        <div class="text-xs-center">
          <v-btn @click="proceed" round color="primary" dark>Proceed</v-btn>
        </div>



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
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        amountText: '',
        emailRules: [
            (v) => !!v || 'E-mail is required',
            (v) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
        ],
        phoneRules: [
            (v) => !!v || 'Phone is required',
            (v) => (v && v.length >= 11) || 'Phone must be valid'
        ],
        nameRules: [
            (v) => !!v || 'Name is required'
        ],
    }
  },
    methods:{
     proceed(){
       if (this.$refs.form.validate())
        this.$emit('done', {firstName: this.firstName, lastName: this.lastName, email: this.email, phone: this.phone})
     }
    },
    props: {
    amount: 0,

  },
  mounted(){

      this.amountText = Utilities.getCommaSeparatedNumber(this.amount.toString());

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
