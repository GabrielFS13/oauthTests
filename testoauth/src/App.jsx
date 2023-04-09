import { useEffect, useState } from 'react';
import {Routes, Route, useLocation, useNavigate} from 'react-router-dom'
import SpotifyPlayer from 'react-spotify-web-playback';

import './App.css';

const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state'

function App() {
  const {state} = useLocation()
  const [token, setToken] = useState()
  const [uris, setUris] = useState([])
  useEffect(()=>{
    if(localStorage.getItem("refreshToken")){
      let code = localStorage.getItem("refreshToken")
      fetch("http://localhost:3030/refresh/"+code)
      .then(resp => resp.json())
      .then(resp => {
        //console.log("Token: ", resp)
        setToken(resp)
      })
      .catch(err => console.log(err))
    }else{
      if(state){
        fetch("http://localhost:3030/code/"+state.code)
        .then(resp => resp.json())
        .then(resp => {
          //console.log(resp)
          setToken(resp.access_token)
          localStorage.setItem("refreshToken", resp.refresh_token)
        } )
        .catch(err => console.log(err))
      }
    }
  }, [state])

  useEffect(()=>{
    if(token){
      fetch("https://api.spotify.com/v1/me/tracks", {
        method: "GET",
        headers :{
            'Authorization': 'Bearer '+token
        }
    })
    .then(resp => resp.json())
    .then(resp => {
      setUris(resp.items.map((music => music.track.uri)))
      console.log(resp)
    })
    .catch(err => console.log(err))
    }
    
  }, [token])
  

  return (
      <Routes>
        <Route path='/' element={<Login token={token} uris={uris} />} />
        <Route path='/callback' element={<Callback />}/>
      </Routes>
  );
}

function Login({token, uris}){
  console.log(uris)
  return(
    <div className="App">
      <a 
      href={`https://accounts.spotify.com/authorize?response_type=code&client_id=b50f78c07342454fb6b13c2988a6a987&scope=${scope}&redirect_uri=http://localhost:3000/callback&state=012313`}>
        Logar com Spotify
      </a>
      <SpotifyPlayer 
        token={token}
        uris={uris}
        initialVolume={0.1}
        inlineVolume={true}
        layout='responsive'
        magnifySliderOnHover={true}
        play={true}
      /> 
    </div>
  )
}

function Callback(){
  const navigate = useNavigate()

  var q = window.location.search.split("&")
  q = q[0].split("=")
  q = q[1]
  console.log("Tá aqui")
  useEffect(() =>{
    navigate("/", {state: {code: q}})
  }, [])
}
export default App;
