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
  robot.respond(/title$/i, (res) => {
    sheets.spreadsheets.getByDataFilter({
      auth: jwtClient,
      spreadsheetId: '18VHHOpXrdMD25979_8T7VUD1PNxjhcVILE3zBbuStN4'
    }, (err, response) => {
      if (err) {
        console.log(err);
        return;
      }
      let printStr = " ";
      // console.log(respond)
      if(printStr == '') {
        res.send('予定はありません');
      }
      else {
        console.log(response.data.properties)
        res.send(response.data.properties.title);
      }
   });
  });

}


module.exports = (robot) => {
  robot.respond(/append:\s*(.+)$/i, (res) => {
    let value = res.match[1];
    value = value.split(',');
    console.log(value)
    prams = {
      spreadsheetId: '18VHHOpXrdMD25979_8T7VUD1PNxjhcVILE3zBbuStN4',
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
          values: [
            value,
          ],
      },
  };
   a = sheets.spreadsheets.values.append(prams, (err, data) => {
      if (err) {
        console.log(err)
        res.send("書き込めませんでした");
      }
      else {
        res.send("書き込めました");
      }
    });
  console.log(a)
  });

};



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

};

