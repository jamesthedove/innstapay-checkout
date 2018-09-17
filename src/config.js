/**
 * Created by James Falade on 16/08/2018.
 */
const urls = [
    'http://localhost:4667/payments/v1/', 'https://api.innstapay.com/payments/v1/'
];
export default {
    baseUrl: urls[0],
    version: require('../package.json').version,
    chargeUrl: `initiateCharge`,
    chargeBankUrl: `initiateBankCharge`,
    continueUrl: `continuePayment`,
    getQrPath: `getTransactionQr`,
    initialiseTransactionUrl: `initialiseTransaction`,
    cancelTransactionUrl: `cancelTransaction`,
    publicKey: `m6i0vf++za7pOQIFESyLW6VLOND54Gtwv7ZRFjwk5w6FggKmEClXyoNfDGp9qRMdZMiJ+HxKhZZsDIi+hyzge4l63sAcUTn0zFLO3IiR/GG6E/ptnOSqEuWxmCInhtNLbrP6NEwTgiwEdZ+wjGGsv9VIE0JXsEQGUC7ljHPdGOE=`
}