const express = require('express')
const QueryString = require('qs')
const request = require('request')
require('dotenv').config()
const app = express()
var cors = require('cors');

const PORT = 3030 || process.env.PORT
const code = undefined;
const clientID = 'b50f78c07342454fb6b13c2988a6a987'
const client_secret = process.env.clientSecret
var redirect_uri = 'http://localhost:3000/callback';
var token = ''
app.use(cors())

app.get('/', (req, res) =>{
    res.send("Hello World")
})

app.get('/login', function(req, res) {

    var state = 'generateRandomString(16)';
    var scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';
  
    res.redirect('https://accounts.spotify.com/authorize?' +
      QueryString.stringify({
        response_type: 'code',
        client_id: clientID,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  });

app.get('/callback', function(req, res) {

    var code = req.query.code || null;
    var state = req.query.state || null;
  
    if (state === null) {
      res.redirect('/#' +
        QueryString.stringify({
          error: 'state_mismatch'
        }));
    } else {
      

      
    }
});

app.get("/code/:code", (req,res) =>{
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
      res.json({access_token, refresh_token})

    }
  });
})

app.get("/refresh/:code", (req, res)=>{
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
      //console.log('foi')
      var access_token = body.access_token;
      res.json(access_token)

    }else{
      console.log(body)
    }
  });
})

app.get('/profile', async (req, res) =>{
    const data = await fetch("https://api.spotify.com/v1/me/tracks", {
        method: "GET",
        headers :{
            'Authorization': 'Bearer '+token
        }
    })
    const info = await data.json()
    console.log(info.items)
    res.send("asd")
})

app.listen(PORT, ()=>{
    console.log("Ouvindo...")
})