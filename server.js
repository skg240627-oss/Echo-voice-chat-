1  const express = require("express");
2  const app = express();
3  const http = require("http").createServer(app);
4  const io = require("socket.io")(http);
5  const mongoose = require("mongoose");
6  const Razorpay = require("razorpay");
7  require("dotenv").config();
8  const path = require("path");
9  
10 app.use(express.json());
11 app.use(express.static("public"));
12 
13 mongoose.connect(process.env.MONGO_URI);
14 
15 const User = mongoose.model("User", { username: String, diamonds: Number, earnings: Number });
16 const Gift = mongoose.model("Gift", { from: String, to: String, diamonds: Number, profit: Number });
17 
18 const razorpay = new Razorpay({
19   key_id: process.env.RAZORPAY_KEY,
20   key_secret: process.env.RAZORPAY_SECRET
21 });
22 
23 app.post("/create-order", async (req,res)=>{
24   const order = await razorpay.orders.create({amount: req.body.amount*100, currency:"INR"});
25   res.json(order);
26 })
27 
28 app.post("/send-gift", async (req,res)=>{
29   const {from, to, diamonds} = req.body;
30   const profit = diamonds * 0.2;
31   await Gift.create({from, to, diamonds, profit});
32   await User.updateOne({username: to}, {$inc: {diamonds: diamonds, earnings: profit}}, {upsert:true});
33   res.json({success:true, myProfit: profit});
34 })
35 
36 app.get("/admin/data", async (req,res)=>{
37   const users = await User.find();
38   const rooms = [{name:"Room 1", host:"King"}];
39   const withdraws = [];
40   res.json({users, rooms, withdraws});
41 })
42 
43 http.listen(3000, ()=>console.log("Server running"));
