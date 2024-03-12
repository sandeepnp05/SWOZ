const dotenv = require('dotenv')
const mongoose = require('mongoose')
const sessionSecret = 'mysessionsecret'

const mongooConnect =()=>{
    
//  mongoose.connect('mongodb+srv://Sandeep:G9PiGosfFRZXocoP@swoz.3vjj8te.mongodb.net/swoz_online')
 mongoose.connect('mongodb+srv://Sandeep:G9PiGosfFRZXocoP@swoz.3vjj8te.mongodb.net/swoz_online')

.then(()=> console.log('connected'))
.catch((err)=> console.log(err.message)) 
}

module.exports = {
    sessionSecret,
    mongooConnect
}