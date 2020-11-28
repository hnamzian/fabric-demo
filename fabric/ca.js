const FabricCAServices = require('fabric-ca-client')
const Connection = require('./connection')
const Wallet = require('./wallet')

module.exports = class CA {
  constructor (ccpPath, walletPath) {
    this.wallet = new Wallet(walletPath)
    
    this.connection = new Connection(ccpPath)
    this.caInfo = this.connection.getCaInfo()
    const caTLSCACerts = this.caInfo.tlsCACerts.pem;
    this.caService = new FabricCAServices(this.caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, this.caInfo.caName);
  }

  async enrollAdminCA (adminCaEnrollment) {
    try {
      const enrollment = await this.caService.enroll(adminCaEnrollment)      
      return enrollment
    } catch (error) {
      throw new Error(`Failed to enroll admin user "admin": ${error}`)
    }
  }

  async registerUser (regRequest, adminId) {
    const adminIdentity = await this.wallet.getIdentity(adminId);
    const provider = await (await this.wallet.getWallet()).getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, adminId);

    const secret = await this.caService.register(regRequest, adminUser)

    return secret
  }

  async enrollUser (enrollmentID, enrollmentSecret, csr = null) {
    let enrollmentRequest = {
      enrollmentID,
      enrollmentSecret
    }
    enrollmentRequest = csr ? { ...enrollmentRequest, csr } : enrollmentRequest

    const enrollment = await this.caService.enroll(enrollmentRequest)

    return enrollment
  }

  async revokeUser (enrollmentId, revokationReason, adminId) {
    const adminIdentity = await this.wallet.getIdentity(adminId);
    const provider = await (await this.wallet.getWallet()).getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, adminId);

    const revokeResult = await this.caService.revoke(
      {
        enrollmentID: enrollmentId,
        reason: revokationReason
      },
      adminUser
    )

    return revokeResult.result
  }

  async softRevokeUser (certificate, revokationReason, gateway) {
    const ca = gateway.getClient().getCertificateAuthority()
    const caUserIdentity = gateway.getCurrentIdentity()

    const certInfo = parseCertificate(certificate)
    const aki = certInfo.getExtAuthorityKeyIdentifier().kid
    const serialNumber = certInfo.getSerialNumberHex()

    const revokeResult = await ca.revoke({
      aki,
      serial: serialNumber,
      reason: revokationReason
    },
    caUserIdentity
    )

    gateway.disconnect()

    return revokeResult.result
  }

  async getCrl (restrictFilter, gateway) {
    const ca = gateway.getClient().getCertificateAuthority()
    const caUserIdentity = gateway.getCurrentIdentity()

    const crl = await ca.generateCRL(restrictFilter, caUserIdentity)
    const parsedCRL = parseCRL(crl)

    gateway.disconnect()

    return parsedCRL
  }
}
