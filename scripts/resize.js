
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const fs = require("fs");


const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
const api_key = "2dad410aae384489902837bba3efbc8d";
metadata.set("authorization", "Key " + api_key);
const Jimp = require('jimp');

const {google} = require('googleapis');
const privatekey = require("./privatekey.json");

let jwtClient = new google.auth.JWT(
  privatekey.client_email,
  null,
  privatekey.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']);

jwtClient.authorize((err, tokens) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Google Oauth authorization succeeded");
});

let sheets = google.sheets({
  "version": 'v4',
  "auth": jwtClient,
});





module.exports = (robot) => {
  robot.respond(/clear$/i, (res) => {
    prams = {
      spreadsheetId: '18VHHOpXrdMD25979_8T7VUD1PNxjhcVILE3zBbuStN4',  
      range: '1:1010', 
      resource: {
        // TODO: Add desired properties to the request body.
      },
      auth: jwtClient,
    };
   a = sheets.spreadsheets.values.clear(prams, (err, data) => {
      if (err) {
        console.log(err)
        res.send("クリアできませんでした");
      }
      else {
        res.send("クリアできました");
      }
    });
  console.log(a)
  });

  const onfile = (res, file) => {
    res.download(file, (path) => {
      let ext = file.name.slice(-4);
      Jimp.read(path).then((image) => {
        image.grayscale((err, image) => {
          let newFileName = Math.random().toString(32).substring(2) + ext;
          
          image.write('images/' + newFileName, (err, image) => {
            let path = 'images/' + newFileName
            const imageBytes = fs.readFileSync(path, { encoding: "base64" });
            stub.PostModelOutputs(
              {
                // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
                model_id: "bicycle-motorcycles-model",
                inputs: [{ data: { image: { base64: imageBytes } } }]
              },
              metadata,
              (err, response) => {
                if (err) {
                  console.log("Error: " + err);
                  return;
                }
            
                if (response.status.code !== 10000) {
                  console.log("Received failed status: " + response.status.description + "\n" + response.status.details + "\n" + response.status.code);
                  return;
                }
            
                console.log("Predicted concepts, with confidence values:")
                let motar =  response.outputs[0].data.concepts[0].value
                let bicycle  =  response.outputs[0].data.concepts[1].value
                console.log(response.outputs[0].data.concepts[0].value)
                for (const c of response.outputs[0].data.concepts) {
                  console.log(c.name + ": " + c.value);
                }
                if (motar > bicycle){
                  massage = "motorcycle"
                }else{
                  massage = "bicycle"
                }
                // res.send(massage)
                console.log(massage)
                prams = {
                  spreadsheetId: '18VHHOpXrdMD25979_8T7VUD1PNxjhcVILE3zBbuStN4',
                  range: 'A1',
                  valueInputOption: 'USER_ENTERED',
                  insertDataOption: 'INSERT_ROWS',
                  resource: {
                      values: [
                        [path,massage],
                      ],
                  },
                };
                a = sheets.spreadsheets.values.append(prams, (err, data) => {
                    if (err) {
                      console.log(err)
                      res.send("書き込めませんでした");
                    }
                    else {
                      res.send("書き込めました",massage);
                    }
                  });
                console.log(a)
                }
            );
            res.send({
              path: path
            },massage);
          });//ファイル保存


        });
      });
    });
  };

  robot.respond('file', (res) => {
    onfile(res, res.json);
  });
};


