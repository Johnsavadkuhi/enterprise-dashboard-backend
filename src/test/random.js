const crypto = require("crypto")

const tokenEncoding = "base64url";


function createSecret() {
  return crypto.randomBytes(32).toString(tokenEncoding);
}

console.log(createSecret())