
const Coupon = require("../models/couponModel");

const loadCoupon = async(req,res)=>{
    try {
        let {message} = req.session;
        req.session.message = ''
        const coupon = await Coupon.find()
        res.render('coupon',{message,coupon})
    } catch (error) {
        next(error)
    }
}

const addCoupon = async(req,res)=>{
    try {
        const {code,limit,description,expireDate,percentage} = req.body;

        const date = expireDate.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const lowerCode = code.toLowerCase();
    const sameCoupon = await Coupon.findOne({ code: lowerCode });
    if (!sameCoupon) {
      const makeCoupon = new Coupon({
        code: code,
        percentage: percentage,
        description: description,
        limit: limit,
        expiryDate: date,
      });
      await makeCoupon.save();
    } else {
      req.session.message = "This code has been already used";
    }
    res.redirect("/admin/coupon");
    } catch (error) {
       console.log(error)
    }
}
const listCoupon = async (req, res, next) => {
    try {
      const { couponId } = req.body;
      const coupon = await Coupon.findById({ _id: couponId });
      if (coupon.status === true) {
        await Coupon.updateOne({ _id: couponId }, { $set: { status: false } });
        res.status(201).json({ unlistSuccess: true });
      } else {
        await Coupon.updateOne({ _id: couponId }, { $set: { status: true } });
        res.status(201).json({ listSuccess: true });
      }
    } catch (err) {
      next(err);
    }
  };
  const editCoupon = async (req, res, next) => {
    try {
      const { id } = req.query;
      const coupon = await Coupon.findById({ _id: id });
      res.render("editCoupon", { coupon });
    } catch (err) {
      next(err);
    }
  };
  const updatedCoupon = async (req, res, next) => {
    try {
      const { id, code, description, percentage, limit, expiryDate } =
        req.body;

      const updatedCoupon = await Coupon.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            code: code,
            description: description,
            percentage: percentage,
            limit: limit,
            expiryDate: expiryDate,
          },
        }
      );
      await updatedCoupon.save();
      res.redirect("/admin/coupon");
    } catch (err) {
      next(err);
    }
  };
module.exports ={
    loadCoupon, 
    addCoupon,
    listCoupon,
    editCoupon,
    updatedCoupon
}