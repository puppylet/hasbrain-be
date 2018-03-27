const jwt = require("./jwt");
const fetch = require("node-fetch");
const qs = require("querystring");
const errors = require('../../../../errors/index');
const GOOGLE_OAUTH2_URL = 'https://accounts.google.com/o/oauth2/token';
let access_token_store = {};

// google object: service_email, shared_secret
module.exports = function(google) {
  let safe_to_perform = new Date();
  safe_to_perform.setMinutes(safe_to_perform.getMinutes() + 5);

  let cached = access_token_store[google.service_email];

  if(cached && cached.access_token && cached.token_expiry_date > safe_to_perform) {
    return Promise.resolve(cached.access_token);
  }

  let jwt_token = jwt({ email: google.service_email, key: google.shared_secret });

  if (!jwt_token) {
    return Promise.reject({ message: "Can't sign JWT token" });
  }

  return fetch(GOOGLE_OAUTH2_URL, {
    method: 'POST',
    body: qs.stringify({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt_token }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  .then(rs => rs.json())
  .then(json => {
    if(!json.access_token) throw errors.invalid_google_iap_credentials;

    // cache for later
    access_token_store[google.service_email] = {
      access_token: json.access_token,
      token_expiry_date: new Date(new Date().getTime() + (json.expires_in * 1000))
    }

    return json.access_token
  })
}