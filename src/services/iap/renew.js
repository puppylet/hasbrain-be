const google_receipt = require("./google/receipt");
const apple_receipt = require("./apple/receipt");
const Receipt = require("../../models/Receipt");
const send_subscription_event = require("../../services/events/subscription");
const build_subscription_event = require("../../services/events/build/subscription");
const store_raw_receipt = require("../../services/iap/store_raw_receipt");
const send_events = require("../../services/events/send");
const errors = require("../../errors/index");

module.exports = function(account, event_props = {}) {
  return Receipt.find({
    account_id: account._id,
    subscription_expiry_date: { $lte: new Date() },
    renew: true
  }).then(receipts => {
    let actions = receipts.map(r => renew(r, account, event_props));
    return Promise.all(actions);
  });
};

function renew(receipt, account, event_props = {}) {
  switch (receipt.platform_purchase) {
    case "APPLE_SANDBOX":
    case "APPLE_PRODUCTION":
      return apple_refresh(receipt, account, event_props);
    case "GOOGLE":
      return google_refresh(receipt, account, event_props);
    default:
      return account;
  }
}

function unsubscribe(receipt) {
  let current_date = new Date();
  receipt.subscription_expiry_date = current_date;
  receipt.renew = false;
  receipt.renew_at = current_date;
  return receipt.save();
}

function apple_refresh(receipt, account, event_props = {}) {
  let { provider, shared_secret, product_id } = receipt.renew_content;
  let { price, currency } = receipt;
  let current_receipt;

  return apple_receipt
    .get(
      { provider, shared_secret },
      {
        receipt: receipt.renew_content.receipt,
        product_id,
        price,
        currency
      }
    )
    .then(apple_receipt => {
      current_receipt = apple_receipt;
      return store_raw_receipt(account, current_receipt);
    })
    .then(() => {
      if (current_receipt.cancelled_receipts)
        send_cancellation_event(
          account,
          current_receipt.cancelled_receipts,
          event_props
        );
      return update_receipt(receipt, current_receipt, account, event_props);
    })
    .catch(err => {
      if (err.cancelled_receipts)
        send_cancellation_event(account, err.cancelled_receipts, event_props);

      let unsubscribe_errors = [
        errors.invalid_receipt.error_code,
        errors.receipt_not_found.error_code,
        errors.cancelled_subscription.error_code
      ];

      if (unsubscribe_errors.indexOf(err.error_code) > -1) {
        return unsubscribe(receipt);
      } else {
        return receipt;
      }
    });
}

function google_refresh(receipt, account, event_props = {}) {
  receipt.renew_content.purchaseToken = receipt.original_transaction_id;
  let { service_email, shared_secret } = receipt.renew_content;
  let current_receipt;

  return google_receipt
    .get({ service_email, shared_secret }, receipt.renew_content)
    .then(google_receipt => {
      current_receipt = google_receipt;
      return store_raw_receipt(account, current_receipt);
    })
    .then(() => update_receipt(receipt, current_receipt, account, event_props))
    .catch(err => {
      let unsubscribe_errors = [errors.invalid_receipt.error_code];

      if (unsubscribe_errors.indexOf(err.error_code) > -1) {
        return unsubscribe(receipt);
      } else {
        return receipt;
      }
    });
}

function update_receipt(receipt, provider_receipt, account, event_props = {}) {
  receipt.subscription_expiry_date = provider_receipt.subscription_expiry_date;
  receipt.renew = provider_receipt.renew;
  receipt.renew_at = provider_receipt.renew_at;

  return receipt.save().then(updated_receipt => {
    let properties = event_props;
    let event_name = "_subscription_renew";

    if (!provider_receipt.subscribed) {
      event_name = "_subscription_expired";
      properties._cancel_reason = receipt.cancelReason;
    }

    send_subscription_event({
      name: event_name,
      account,
      receipt: provider_receipt,
      properties
    });

    return updated_receipt;
  });
}

function send_cancellation_event(account, receipts, event_props) {
  let events = receipts.map(receipt => {
    let properties = Object.assign({}, event_props, {
      _cancellation_date: receipt.cancellation_date
    });

    return build_subscription_event({
      name: "_subscription_cancel",
      account,
      receipt,
      properties
    });
  });

  send_events(events);
}
