const store_raw_receipt = require("./store_raw_receipt");
const mongoose = require('mongoose');
const Receipt = mongoose.model('Receipt');

const iap_service = {
  create: function(receipt, provider_receipt) {
    const actions = [
      Receipt.create(
        Object.assign({}, receipt, this.extract(provider_receipt))
      ),
      store_raw_receipt(
        { _project_id: receipt.project_id, _id: receipt.account_id },
        provider_receipt
      )
    ];

    return Promise.all(actions);
  },

  update: function(receipt, provider_receipt) {
    const updates = this.extract(provider_receipt);
    
    Object.keys(updates).forEach(k => {
      receipt[k] = updates[k];
    });

    const actions = [
      receipt.save(),
      store_raw_receipt(
        { _project_id: receipt.project_id, _id: receipt.account_id },
        provider_receipt
      )
    ];

    return Promise.all(actions);
  },

  extract: function(provider_receipt) {
    return (({
      subscription_expiry_date,
      purchase_date,
      platform_purchase,
      renew,
      renew_at
    }) => ({
      subscription_expiry_date,
      purchase_date,
      platform_purchase,
      renew,
      renew_at
    }))(provider_receipt);
  }
};

module.exports = iap_service;
