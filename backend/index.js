const express = require("express")
const cors = require("cors")
// Install Nodemailer
const nodemailer = require("nodemailer");
const mongoose = require("mongoose")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://vidhya:vidhya123@cluster0.gryvbqp.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0").then(function(){
    console.log("Database Connected...")
}).catch(function(err){
    console.log("Failed to Connect:",err)
})

const credential = mongoose.model("credential",{},"bulkmail")


app.post("/sendemail", function (req, res) {

    var msg = req.body.msg
    var emailList = req.body.emailList

credential.find().then(function(data){
    const transporter = nodemailer.createTransport({
    service: "gmail", // true for 465, false for other ports
    auth: {
        user: data[0].toJSON().user,
        pass: data[0].toJSON().pass,
    },
});
    new Promise(async function (resolve, reject) {
        try {
            for (var i = 0; i < emailList.length; i++) 
            {
                await transporter.sendMail(
                    {
                        from: "itsmevidhya10@gmail.com",
                        to: emailList[i],
                        subject: "A Message from Bulk Mail App",
                        text: msg
                    }
                )
                console.log("Email sent to:"+emailList[i])
            }
            resolve("Success")

        }
        catch (error) 
        {
            reject("Failed")
        }
    }).then(function () {
            res.send(true)
    }).catch(function () {
            res.send(false)
    })
}).catch(function(error){
    console.log(error)
})

})

app.listen(5000, function () {
    console.log("Server Started......")
})