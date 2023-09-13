const mongoose = require('mongoose')

const Schema  = mongoose.Schema

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required : true,
        unique:true
    },
    description:{
        type:String,
        required: true
    },
    expiryDate:{
        type:Date,
        required: true
    },
    percentage:{
        type:Number,
        required: true
    },
    limit:{
        type:Number,
        required: true
    },
    status:{
        type:Boolean,
        default:true,
        required:true,
    },
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }
    ],
},
{
    timestamps:true
});
module.exports = mongoose.model('coupon',couponSchema)