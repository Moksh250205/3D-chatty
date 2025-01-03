const mongoose = require('mongoose'); 

const dbConnect = () => {
    const connection = mongoose.connect(process.env.MONGO_URL); 
    console.log("Connection established");
    
}

module.exports = dbConnect;