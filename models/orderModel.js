const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const orderSchema = new mongoose.Schema({
  user:{
    type: ObjectId,
    ref : 'User',
    required: true,
  },
  products:[
    {
        productId:{
            type:ObjectId,
            ref:"Products"
        },
        quantity:{
            type:Number,
        },
        price:{
            type:Number,
        }
    }
  ],
  total:{
    type:Number,
    required:true
  },
   status:{
    type:String,
    required:true,
   },
   method:{
    type:String,
    enum:["COD"],
    required:true,
   },
   date:{
    type:String
   },
   time:{
    type:String,
   },
   expectedDelivery:{
    type:Date,
   }
},{timestamps:true});

module.exports = mongoose.model("order",orderSchema);
