const Identity = require('./identity')
const { Wallets } = require('fabric-network')

module.exports = class FabricWallet {
  constructor (walletPath) {
    this.walletPath = walletPath
  }

  async getWallet() {
    return await Wallets.newFileSystemWallet(this.walletPath)
  }

  async getIdentity(userId) {
    const wallet = await Wallets.newFileSystemWallet(this.walletPath)
    return await wallet.get(userId)
  }
  
  async importIdentity (enrollmentId, key, cert, mspId) {
    let wallet = await Wallets.newFileSystemWallet(this.walletPath)

    wallet = await this.deleteIdentity(enrollmentId, wallet)

    const userIdentity = Identity.createIdentity(key, cert, mspId)

    await wallet.put(enrollmentId, userIdentity)

    return wallet
  }

  async existsIdentity (enrollmentId) {
    const identityList = await this.listIdentities()
    return identityList.includes(enrollmentId)
  }

  async listIdentities () {
    const wallet = await Wallets.newFileSystemWallet(this.walletPath)
    const identities = await wallet.list()
    return identities
  }

  async deleteIdentity (enrollmentId, wallet) {
    const userExists = await this.existsIdentity(enrollmentId)
    if (!userExists) return wallet

    await wallet.remove(enrollmentId)
    return wallet
  }
}
