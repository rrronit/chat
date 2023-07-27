const express=require("express")
const { getAllMessage } = require("../Controller/MessageController")
const router=express.Router()


router.get("/all",getAllMessage)

module.exports=router;