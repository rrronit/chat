const async_handler = require("../Middleware/async_handler");
const messages = require("../Schema/messageSchema");

exports.getAllMessage=async_handler(async(req,res,next)=>{
    const message=await messages.find()

    res.status(201).json({
        success:true,
        message
    })
})
