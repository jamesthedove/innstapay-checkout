/**
 * Created by James Falade on 16/08/2018.
 */
export default {
    baseUrl: process.env.VUE_APP_BASE_URL,
    version: '0.1.0',
    chargeUrl: `initiateCharge`,
    chargeBankUrl: `initiateBankCharge`,
    continueUrl: `continuePayment`,
    getQrPath: `getTransactionQr`,
    initialiseTransactionUrl: `initialiseTransaction`,
    cancelTransactionUrl: `cancelTransaction`,
    publicKey: `m6i0vf++za7pOQIFESyLW6VLOND54Gtwv7ZRFjwk5w6FggKmEClXyoNfDGp9qRMdZMiJ+HxKhZZsDIi+hyzge4l63sAcUTn0zFLO3IiR/GG6E/ptnOSqEuWxmCInhtNLbrP6NEwTgiwEdZ+wjGGsv9VIE0JXsEQGUC7ljHPdGOE=`
}
