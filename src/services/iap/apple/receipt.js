const errors = require('../../../../errors/index');
const fetch = require('node-fetch');

const apple_receipt = {
    get: function(apple, purchase_info) {
        let verify_url = (apple.provider === "APPLE_PRODUCTION") ? "https://buy.itunes.apple.com/verifyReceipt" : "https://sandbox.itunes.apple.com/verifyReceipt";
        let price = purchase_info.price ? parseFloat(purchase_info.price) : 0;
        let currency = purchase_info.currency ? purchase_info.currency.toUpperCase().trim() : null;

        return fetch(verify_url, {
            method: 'POST',
            body: JSON.stringify({ "receipt-data": purchase_info.receipt, password: apple.shared_secret }),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(res => res.json())
            .then(receipt => {
                if(receipt.status !== 0) throw Object.assign({}, errors.invalid_receipt, { apple_error_code: receipt.status });

                let latest_receipt = get_latest_receipt(receipt, purchase_info.product_id);
                if(!latest_receipt) throw errors.receipt_not_found;

                let extra = { price, currency, platform_purchase: apple.provider };
                if(latest_receipt.cancellation_date) {
                    throw Object.assign({}, errors.cancelled_subscription, {
                        cancelled_receipts: get_cancelled_receipts(receipt, purchase_info.product_id, extra)
                    });
                };

                return output_receipt(receipt.receipt, latest_receipt, extra);
            })
    }
}

function output_receipt(root_receipt, current_receipt, extra = {}) {
    let current_date = new Date();
    let raw_data = Object.assign({}, current_receipt, { receipt: root_receipt });
    let output = Object.assign(extra, {
        raw_data, package_id: current_receipt.product_id, package_name: root_receipt.bundle_id
    })

    output.original_transaction_id = current_receipt.original_transaction_id;
    output.transaction_id = current_receipt.transaction_id;
    output.cancellation_date = current_receipt.cancellation_date;
    output.subscription_expiry_date = new Date(parseInt(current_receipt.expires_date_ms));
    output.purchase_date = new Date(parseInt(current_receipt.purchase_date_ms));
    output.subscribed = output.subscription_expiry_date > current_date;
    output.renew = output.subscribed;
    output.renew_at = current_date;

    return output;
}

function get_receipt_list(receipt, product_id) {
    let receipt_list = [];

    if(receipt.latest_receipt_info && receipt.latest_receipt_info.length > 0) {
        receipt_list = receipt.latest_receipt_info;
    } else {
        receipt_list = receipt.receipt.in_app
    }

    if(product_id) {
        receipt_list = receipt_list.filter(r => r.product_id === product_id)
    }

    return receipt_list;
}

function get_latest_receipt(receipt, product_id) {
    let receipt_list = get_receipt_list(receipt, product_id);
    return receipt_list[receipt_list.length - 1];
}

function get_cancelled_receipts(receipt, product_id, extra = {}) {
    let current_time = new Date().getTime();

    let cancelled_receipts = get_receipt_list(receipt, product_id).filter(receipt => {
        return (current_time - receipt.purchase_date_ms) < (3600000 * 24 * 90) && receipt.cancellation_date
    });

    return cancelled_receipts.map(cancelled_receipt => output_receipt(receipt.receipt, cancelled_receipt, extra))
}

module.exports = apple_receipt;