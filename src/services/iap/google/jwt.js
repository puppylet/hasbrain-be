const crypto = require('crypto');
const GOOGLE_OAUTH2_URL = 'https://accounts.google.com/o/oauth2/token';
const scope = "https://www.googleapis.com/auth/androidpublisher"

module.exports = function(options) {
  ({ email, key } = options);
	let iat = Math.floor(new Date().getTime() / 1000);
    
  let exp = iat + 3600;
  let claims = {
    iss: email,
    scope: scope,
    aud: GOOGLE_OAUTH2_URL,
    exp: exp, iat: iat
  };

  try {
    let JWT_header = new Buffer(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString('base64');
    let JWT_claimset = new Buffer(JSON.stringify(claims)).toString('base64');
    let unsignedJWT = [JWT_header, JWT_claimset]. join('.');

    let JWT_signature = crypto.createSign('RSA-SHA256').update(unsignedJWT).sign(key, 'base64');
    return [unsignedJWT, JWT_signature].join('.');
  } catch(e) {
    return null;
  }
}