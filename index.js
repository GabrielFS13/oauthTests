const express = require('express')
const request = require('request')
require('dotenv').config()
const app = express()
var cors = require('cors');

const PORT = 3030 || process.env.PORT
const clientID = '5afe486064b145c6a8c852bd53deea04'
const client_secret = process.env.clientSecret
const redirect_uri = process.env.redirect_uri

app.use(cors())

app.get("/", cors(), (req, res) =>{
  res.send('Hello World')
})

app.get("/code/:code", cors(), (req,res) =>{
  console.log(req.params.code)
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: req.params.code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(clientID + ':' + client_secret).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      //console.log('foi')
      var access_token = body.access_token;
      var refresh_token = body.refresh_token;
      console.log(access_token)
      res.json({access_token, refresh_token})
    }else{
      //console.log(body)
      console.log(response)
    }
  });
})

app.get("/refresh/:code", cors(corsOptions), (req, res)=>{
  var code = req.params.code
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(clientID + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: code
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log('foi refresh')
      var access_token = body.access_token;
      res.json(access_token)

    }else{
      console.log(body)
    }
  });
})


app.listen(PORT, ()=>{
    console.log("Ouvindo...")
})