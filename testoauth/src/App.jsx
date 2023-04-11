import { useEffect, useState } from 'react';
import {Routes, Route, useLocation, useNavigate} from 'react-router-dom'
import SpotifyPlayer from 'react-spotify-web-playback';
import './App.css';

const clientid = '5afe486064b145c6a8c852bd53deea04'
const redirect = process.env.REACT_APP_REDIRECT_URI
const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-library-read'
const state = Math.floor(Math.random() * 10^3)
const authLink = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientid}&scope=${scope}&redirect_uri=${redirect}&state=${state}`
const baseURL = process.env.REACT_APP_BASE_URL
function App() {
  const {state} = useLocation()
  const [token, setToken] = useState()
  const [musics, setMusics] = useState([])
  const [selectedMusic, setSelected] = useState([])
  const [apiUrl, setApiUrl] = useState("https://api.spotify.com/v1/me/tracks")

  useEffect(()=>{
    
    if(localStorage.getItem("refreshToken")){
      let code = localStorage.getItem("refreshToken")
      fetch(baseURL+"/refresh/"+code)
      .then(resp => resp.json())
      .then(resp => {
        //console.log("Token: ", resp)
        setToken(resp)
      })
      .catch(err => console.log(err))
    }else{
      if(state){
        fetch(baseURL+"/code/"+state.code)
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
      fetch(apiUrl, {
        method: "GET",
        headers :{
            'Authorization': 'Bearer '+token
        }
    })
    .then(resp => resp.json())
    .then(resp => {
      setApiUrl(resp?.next)
      setMusics([...musics, ...resp?.items])

      console.log(musics)
      //console.log(resp) 
    })
    .catch(err => console.log(err))
    }
  }, [token, apiUrl])
  

  return (
      <Routes>
        <Route path='/' element={<Login token={token} uris={selectedMusic} musics={musics} setSelected={ (e) => setSelected(e)} />} />
        <Route path='/callback' element={<Callback />}/>
      </Routes>
  );
}

function Login({token, uris, musics, setSelected}){
  return(
    <div className="App">
      <a 
      href={authLink}>
        Logar com Spotify
      </a>
      <div className="musics">
        {musics?.map((musica, i) =>{
          return(
            <button onClick={() => setSelected([musica.track.uri])} key={i}>
              <img src={musica.track.album.images[2].url} alt={musica.track.name}/>
              <h2>Música: {musica.track.name}</h2>
            </button>
          )
        })}
      </div>
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
