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
  }
},{timestamps:true});

module.exports = mongoose.model("order",orderSchema);
