const errors = require('../../../../errors/index');
const fetch = require('node-fetch');
const access_token = require('./access_token');

const google_receipt = {
    get: function(google, purchase_info) {
        return access_token(google)
            .then(token => {
                let verify_url = `https://www.googleapis.com/androidpublisher/v2/applications/${purchase_info.packageName}/purchases/subscriptions/${purchase_info.productId}/tokens/${purchase_info.purchaseToken}`;
                return fetch(verify_url, { headers: { Authorization: 'Bearer ' + token }})
            })
            .then(rs => rs.json())
            .then(receipt => {
                if(receipt.error) throw Object.assign({}, errors.invalid_receipt, { google_error_code: receipt.error.code, message: receipt.error.message });
                if(receipt.paymentState === 0) throw errors.payment_pending;

                let current_date = new Date();
                let output = { raw_data: receipt, package_id: purchase_info.productId, package_name: purchase_info.packageName };

                output.original_transaction_id = purchase_info.purchaseToken;
                output.subscription_expiry_date = new Date(parseInt(receipt.expiryTimeMillis));
                output.purchase_date = new Date(parseInt(receipt.startTimeMillis));
                output.subscribed = output.subscription_expiry_date > current_date;
                output.platform_purchase = "GOOGLE";
                output.renew = receipt.autoRenewing;
                output.renew_at = current_date;
                output.price = parseFloat(receipt.priceAmountMicros) / 1000000;
                output.currency = receipt.priceCurrencyCode;

                return output;
            })
    }
}

module.exports = google_receipt;