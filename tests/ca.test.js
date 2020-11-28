const CA = require('../fabric/ca')
const Wallet = require('../fabric/wallet')
const Connection = require("../fabric/connection")
const randToken = require('rand-token').generator({ chars: 'numeric' })
const path = require('path')

const ccpPath = path.join(__dirname, "..", "storage", "connection-org1.json")
const walletPath = path.join(__dirname, "..", "wallet")

const connection = new Connection(ccpPath)
const wallet = new Wallet(walletPath)
const ca = new CA(ccpPath, walletPath)

async function getAdminCA() {
  const adminCA = await ca.enrollAdminCA({
    enrollmentID: "admin",
    enrollmentSecret: "adminpw"
  })
  wallet.importIdentity("admin", adminCA.key.toBytes(), adminCA.certificate, connection.getMspId())
}

async function registerUser(userId) {
  const regRequest = {
    enrollmentID: userId,
    affiliation: "org1.department1",
    role: 'client',
    maxEnrollments: 3,
    attrs: [{ name: 'maskanRole', value: 'REAL', ecert: true }]
  }
  const secret = await ca.registerUser(regRequest, "admin")
  const enrollment = await ca.enrollUser(userId, secret)
  
  wallet.importIdentity(userId, enrollment.key.toBytes(), enrollment.certificate, connection.getMspId())
}

async function revokeUser(userId) {
  const crl = await ca.revokeUser(userId, "", "admin")
  console.log(crl);
}


async function main() {
  const userId = randToken.generate(10)
  
  await getAdminCA()
  await registerUser(userId)
  await revokeUser(userId)
}

main()