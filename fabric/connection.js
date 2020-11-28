const fs = require('fs')

module.exports = class Connection {
  constructor(ccpPath) {
    this.ccpPath = ccpPath
    this.ccp = JSON.parse(fs.readFileSync(this.ccpPath).toString())
  }

  getCaInfo () {
    const orgName = this.ccp.client.organization
    const caInfo =
      this.ccp.certificateAuthorities[
        this.ccp.organizations[orgName].certificateAuthorities
      ]
    return caInfo
  }

  getMspId() {
    const orgName = this.ccp.client.organization
    return this.ccp.organizations[orgName].mspid
  }
}