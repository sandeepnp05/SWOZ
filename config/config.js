const dotenv = require('dotenv')
const mongoose = require('mongoose')
const sessionSecret = 'mysessionsecret'

const mongooConnect =()=>{
    
 mongoose.connect('mongodb://127.0.0.1:27017/swoz_online')
.then(()=> console.log('connected'))
.catch((err)=> console.log(err.message)) 
}

module.exports = {
    sessionSecret,
    mongooConnect
}