const mongoose = require('mongoose')
const dotenv = require('dotenv').config()
const sessionSecret = 'mysessionsecret'

const mongooConnect =()=>{
 mongoose.connect(process.env.MONGO_URL)
.then(()=> console.log('connected'))
.catch((err)=> console.log(err.message)) 
}

module.exports = {
    sessionSecret,
    mongooConnect
}