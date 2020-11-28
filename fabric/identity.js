module.exports = class Identity {
    static createIdentity (key, cert, mspId) {
      return {
        credentials: {
          certificate: cert,
          privateKey: key,
        },
        mspId,
        type: 'X.509',
      }
    }
  }
  