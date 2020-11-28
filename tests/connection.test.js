const Connection = require('../fabric/connection')
const path = require('path')

const ccpPath = path.join(__dirname, "..", "storage", "connection-org1.json")
const connection = new Connection(ccpPath)

const caInfo = connection.getCaInfo()
const mspId = connection.getMspId()

console.log(caInfo)
console.log(mspId)