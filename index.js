const express = require("express");
const bodyParser = require("body-parser");
const app = express();

var pdf = require('html-pdf');
var pdf2png = require('pdf2png');
const url = require('url');

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.set('ManiRoute', "");
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    res.header("Access-Control-Allow-Headers", "x-requested-with, Content-Type, origin, authorization, accept, client-security-token");

    next();
});

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to HTML-IMAGE-PDF." });
});

const moment = require("moment");
const fs = require("fs");

app.post("/hpdf", (request, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let reqParam = request.body;
    console.log("Welcome.....");
    console.log("reqParam", reqParam);

    var resultObj = {};
    const htmlData = reqParam.htmlData;
    const fileName = reqParam.fname;
    // const type = reqParam.type;

    let options = { format: 'A4' };
    // Example of options with args //
    // let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };

    let file = { content: htmlData };

    pdf.create(htmlData, options).toBuffer(function(err, pdfBuffer) {

        const base64Image = new Buffer.from(pdfBuffer).toString('base64');
        const dataURI = 'data:application/pdf;base64,' + base64Image;

        var utc = (moment.utc()).valueOf();
        var path = 'tmp/pdf/';
        var fname = fileName + '_' + utc + '.pdf';
        var fileLocation = path + fname;
        var pngFileLocation = 'tmp/image/'+fileName + '_' + utc + '.png';

        fs.writeFile(fileLocation, base64Image, 'base64', function(err) {
            if (err) { console.log(err) } else {
                console.log("PDF Uploaded successfully..")
            }
        });

        generatePNG(fileLocation, pngFileLocation);


        resultObj = {
            'Msg': 'PDF created successfully...',
            'image': dataURI,
            'base64': base64Image

        }
        return res.json(resultObj);
    });



});

function generatePNG(fileLocation, pngFileLocation){

    pdf2png.convert(fileLocation, { returnFilePath: true }, function(resp) {
      if (!resp.success) { return; }

      fs.writeFile(pngFileLocation, resp.data, function(err) {
          if (err) { console.log(err); } else {
              console.log("PNG created successfully...");
          }
      });
    });
}
// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});