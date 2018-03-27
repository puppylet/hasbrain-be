module.exports = function(old_expiry_date, new_expiry_date) {
  if(!old_expiry_date) {
    return "_subscription_purchased";
  }

  if(old_expiry_date < new_expiry_date){
    return "_subscription_renew";
  } else {
    return "_subscription_check";
  }
}