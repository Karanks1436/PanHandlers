var express= require("express");
var app=express();
var fileUploader=require("express-fileupload");
var cloudinary=require("cloudinary").v2;
var nodemailer = require("nodemailer");
var mysql2= require("mysql2"); 

const bodyParser = require('body-parser');  
require('dotenv').config();
 
app.use(express.static("public"));
app.use(express.urlencoded(true)); 
app.use(fileUploader());

let dbconfig= "mysql://avnadmin:AVNS__SxktxwBy87P99ml2Hu@mysql-bce-karanksxxx-a6bb.i.aivencloud.com:10904/defaultdb";
let mysqlserver= mysql2.createConnection(dbconfig);

cloudinary.config({ 
    cloud_name: 'dbvdxepqe',  
    api_key: '116987294548589',  
    api_secret: 'SQ3xj_ETHnyn8n8A6x2aOWW3CeE' // Click 'View API Keys' above to copy your API secret
});


app.listen(1400,function(){
    console.log("server is running on port 1400");
})

app.get("/",function(req,resp){
    dirName = __dirname;
    let fullpath=dirName+"/public/index.html";
    resp.sendFile(fullpath);
})

mysqlserver.connect(function(err){
    if(err)
    {
        console.log(err);
    }else{
        console.log("connected to db");
    }
})

app.get("/url-signup-process",function(req,resp){
    mysqlserver.query("INSERT INTO users VALUES (?,?,?,CURDATE(),?)", [req.query.email, req.query.password, req.query.usertype,"1"], function (err) {
        if (err == null) {
            resp.send("Record Saved Successfully.. Badhaiiii");
        } else {
            console.error("DB Error:", err);
            resp.status(500).send("Database Error: " + err.message);
        }
    });
})

app.get("/url-login-process",function(req,resp){
    mysqlserver.query("SELECT * from users where email=? and password=? and status=?", [req.query.email, req.query.password,"1"], function (err,resultAry)
     {
        if (err == null) {
        if(resultAry.length==0)
           // resp.status(401).send("Invalid credentials");
             resp.send("Invalid User Id or Password"); 
        else{

            // resp.send("Logged in...............");
            resp.send(resultAry[0].usertype);
            console.log("logged in");
            
        }
    }
    else
    {
        resp.send(err.message)
    }
}
);
})


app.get("/do-check-email",function(req,resp){
    mysqlserver.query("select * from volkyc where emailid=?",[req.query.x],function(err,result){     
            if(result.length==0)
            {
                resp.send("Available");
            }else
            resp.send("Already Taken");
    })
});


app.post("/updatedata", async function(req, resp) {
    let fileName = "nopic.jpg"; 
    let fileName2 = "nopic.jpg"; 

    if (req.files && req.files.profpic) {
        try {
            const file = req.files.profpic;
            fileName = file.name;
            let locationToSave = __dirname + "/public/uploads/" + fileName;

            await file.mv(locationToSave);

            const picUrlResult = await cloudinary.uploader.upload(locationToSave);
            fileName = picUrlResult.url;
            console.log("Profile Picture URL:", fileName);
        } catch (err) {
            return resp.status(500).send("Error uploading profile picture: " + err.message);
        }
    }
    if (req.files && req.files.idpath) {
        try {
            const file = req.files.idpath;
            fileName2 = file.name;
            let locationToSave = __dirname + "/public/uploads/" + fileName2;
            await file.mv(locationToSave);
            const picUrlResult = await cloudinary.uploader.upload(locationToSave);
            fileName2 = picUrlResult.url; 
            console.log("ID Path URL:", fileName2);
        } catch (err) {
            return resp.status(500).send("Error uploading ID path: " + err.message);
        }
    }

    const { txtName, txtContact, txtAddress, txtCity, gen, txtDob, qual, occu, info, txtEmail } = req.body;

    console.log("Form data received:", JSON.stringify(req.body));
    mysqlserver.query("UPDATE volkyc SET name=?, contact=?, address=?, city=?, gender=?, dob=?, quali=?, occu=?, info=?, picpath=?, idpath=? WHERE emailid=?", [
        txtName, txtContact, txtAddress, txtCity, gen, txtDob, qual, occu, info, fileName, fileName2, txtEmail
    ], function(err, result) {
        if (err) {
            return resp.status(500).send("Database error: " + err.message);
        }

        if (result.affectedRows === 1) {
            return resp.send("Record Updated Successfully");
        } else {
            return resp.send("Invalid Email or no changes made.");
        }
    });
});


app.get("/fetchone",function(req,resp){
    mysqlserver.query("select * from volkyc where emailid=?",[req.query.txtEmail],function(err,result){
           
                resp.send(result);
                console.log(result);
          
    })
}) 

app.post("/do-delete", function(req,resp){
    mysqlserver.query("delete from volkyc where emailid=?",[req.body.txtEmail], function(err,result){
        if(err==null)
        {
            if(result.affectedRows==1)
                resp.send("Deleted Successfully.......");
            else
            resp.send("No Record Found");
        }else
        resp.send(err.message);
    })
})


app.get("/fetch-one",function(req,resp){
    mysqlserver.query("select * from cprofile where email=?",[req.query.txtEmail],function(err,result){
           
                resp.send(result);
                console.log(result);
          
    })
}) 

 
app.post("/vol-kyc",async function(req,resp){
    
    let fileName;
    if(req.files!=null)
    {
        fileName=req.files.profpic.name;
        let locationToSave=__dirname+"/public/uploads/"+fileName;//full ile path
        req.files.profpic.mv(locationToSave);//saving file in uploads folder

         //saving ur file/pic on cloudinary server
         try{
         await cloudinary.uploader.upload(locationToSave).then(function(picUrlResult){
            fileName=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log(fileName);
            });
        }
        catch(err)
        {
            resp.send(err.message);
        }

    }
    else
    fileName="nopic.jpg";

    let fileName2;
    if(req.files!=null)
    {
        fileName2=req.files.idpath.name;
        let locationToSave=__dirname+"/public/uploads/"+fileName2;//full ile path
        req.files.idpath.mv(locationToSave);//saving file in uploads folder

         //saving ur file/pic on cloudinary server
         try{
         await cloudinary.uploader.upload(locationToSave).then(function(picUrlResult){
            fileName2=picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log(fileName2);
            });
        }
        catch(err)
        {
            resp.send(err.message);
        }

    }
    else
    fileName2="nopic.jpg";
    

    let str=JSON.stringify(req.body); 
    console.log("Form data received:", str);
 
    mysqlserver.query("insert into volkyc values(?,?,?,?,?,?,?,?,?,?,?,?)", [req.body.txtEmail, req.body.txtName, req.body.txtContact, req.body.txtAddress, req.body.txtCity, req.body.gen, req.body.txtDob, req.body.qual, req.body.occu, req.body.info, fileName, fileName2], function (err) {
        if(err==null)
            {
                resp.send("Uploaded Successsfulllyyy.. ");
            }
            else
            resp.send(err.message);
    });
}) 

app.get("/vol-kyc",async function(req,resp){
    resp.sendFile(__dirname + "/public/vol-kyc.html");
    
}) 

app.get("/client-kyc", function(req,resp){
    resp.sendFile(__dirname + "/public/client-kyc.html");
    
    
}) 
 
app.post("/client-kyc", function(req,resp){
    mysqlserver.query("insert into cprofile values(?,?,?,?,?,?,?,?,?,?)", [req.body.txtEmail, req.body.txtName, req.body.txtContact, req.body.txtAddress, req.body.txtCity, req.body.firm, req.body.business, req.body.idtype, req.body.idproof,req.body.idnumber, req.body.info], function (err) {
        if(err==null) 
            {
                resp.send("Uploaded Successsfulllyyy.. ");
            }
            else
            resp.send(err.message);
    });

     
}) 



app.get("/fetchclientpost",function(req,resp){
    mysqlserver.query("select * from jobs where cid=?",[req.query.txtEmail],function(err,result){
           
                resp.send(result);
                console.log(result);
          
    })
}) 



 
app.post("/update-data", async function(req, resp) {
   
    mysqlserver.query("update cprofile set name=?, contact=?, address=?, city=?, business=?, bprofile=?, idproof=?, idnumber=?, info=? WHERE email=?", [
        req.body.txtName, req.body.txtContact, req.body.txtAddress, req.body.txtCity, req.body.firm, req.body.business, req.body.idtype, req.body.idnumber, req.body.info, req.body.txtEmail
    ], function(err, result) {
        if (err) {
            return resp.send(err.message);
        } 
        if (result.affectedRows === 1) {
            resp.send("Record Updated Successfully");
        } else {
            resp.send("Invalid Email");
        }
    });
}); 
 
app.post("/post-job", function(req, resp){
    mysqlserver.query(
        "INSERT INTO jobs VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [null, req.body.txtEmail, req.body.jobtitle, req.body.jobtype, req.body.firmaddr, req.body.city, req.body.edu, req.body.contact],
        function(err) {
            if (err == null) {
                resp.send("Uploaded Successfully...");
            } else {
                resp.send(err.message);
            }
        }
    );
});

app.get("/all-records",function(req,resp)
{
    mysqlserver.query("select * from users",function(err,result)
    {
        console.log(result);
        resp.send(result);
    })
})


app.get("/block-record-one",function(req,resp)
{
    mysqlserver.query("update users set status=0 where email=?",[req.query.email],function(err,result)
    {
        console.log(result);
        resp.send(result);
    })
})


app.get("/resume-record-one",function(req,resp)
{
    mysqlserver.query("update users set status=1 where email=?",[req.query.email],function(err,result)
    {
        console.log(result);
        resp.send(result);
    })
}) 



app.get("/vol-manager",function(req,resp)
{
    mysqlserver.query("select * from users where usertype='volunteer'",function(err,result)
    {
        console.log(result);
        resp.send(result);
    })
})



app.get("/client-manager",function(req,resp)
{
    mysqlserver.query("select * from users where usertype='client'",function(err,result)
    {
        console.log(result);
        resp.send(result);
    })
})


app.get("/city-records",function(req,resp)
{
    mysqlserver.query("select distinct city from jobs",function(err,result)
    {
        console.log(result);
        resp.send(result);
    })
})


app.get("/jobtitle-records",function(req,resp)
{
    mysqlserver.query("select distinct jobtitle from jobs",function(err,result)
    {
        console.log(result);
        resp.send(result);
    })
})

app.get("/job-search", function(req, resp) {
    mysqlserver.query("select * from jobs where city=? and jobtitle=?", [req.query.city, req.query.jobtitle],
        
         function(err, result) {
        if (err) {
            resp.status(500).send(err.message);
        } else {
            resp.send(result);
        }
    });
});
