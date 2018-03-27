const mongoose = require('mongoose');
const RawReceipt = mongoose.model('RawReceipt');

module.exports = function(account, receipt) {
  let { purchase_date, platform_purchase, raw_data } = receipt;

  return RawReceipt.create({
    project_id: account._project_id, account_id: account._id,
    original_transaction_id: receipt.original_transaction_id,
    expiry_date: receipt.subscription_expiry_date,
    platform_purchase, purchase_date, raw_data
  })
}