const Coupon = require("../models/couponModel");

module.exports = {

    discountPrice : async ( couponId, grandTotal ) => {
        console.log('yyyyy');
        const coupon = await Coupon.findById(couponId);
        
  if(coupon){
      let discountAmount = 0;
      discountAmount =  Math.round((coupon.percentage / 100) * grandTotal);
      // Calculate the discounted total
      const discountedTotal =Math.round( grandTotal - discountAmount);
      console.log('discountedTotal:',discountedTotal, 'kkkk',discountAmount,'<=discountAmouint');
      return { discountAmount, discountedTotal }
  }else{
    return null;
  }
  }      
}