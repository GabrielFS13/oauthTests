import { useEffect, useState } from 'react';
import {Routes, Route, useLocation, useNavigate} from 'react-router-dom'
import SpotifyPlayer from 'react-spotify-web-playback';
import {BsFillPlayFill, BsSoundwave} from 'react-icons/bs'

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
        <Route path='/' element={<Home token={token} uris={selectedMusic} musics={musics} setSelected={ (e) => setSelected(e)} />} />
        <Route path='/callback' element={<Callback />}/>
      </Routes>
  );
}

function Home({token, uris, musics, setSelected}){
  const [hover, setHover] = useState({i: null, hover: null})

  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

  function formatDate(undate){
    const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out" ,"nov", "dez"]
    const date = new Date(undate)
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()

    return `${day} de ${months[month]} de ${year}`
  }
  
  return(
    <div className="App">
      {!token ? 
      <a href={authLink}>
        Logar com Spotify
      </a>: ''}
      <div className="musics">
        <table border={0}>
          <thead>
            <tr>
              <th className='header_button'>#</th>
              <th className='header_title'>Título</th>
              <th className='header_album'>Álbum</th>
              <th className='header_added'>Adicionado em</th>
              <th className='header_time'>Duração</th>
            </tr>
          </thead>
          <tbody>
            {musics?.map((musica, i) =>{
            return(
              <div 
              className="track" 
              onMouseEnter={() => {setHover({i: i, hover: <BsFillPlayFill />})}}
              onMouseLeave={() => {setHover({i: null, hover: null})}}
              >
                <tr>
                <td className='play_button header_button'>
                  <button onClick={() => setSelected([musica.track.uri])} key={i} id={i}>
                    { uris == musica.track.uri ? <BsSoundwave color="green" /> : hover.i === i ? hover.hover : i + 1 }
                  </button>
                </td>
                <td className='header_title'>
                  <div className="music_infos">
                    <div className="img">
                      <img src={musica.track.album.images[2].url} alt={musica.track.name}/>
                    </div>
                    <div className="music_title_artits">
                      <span className='music_name'>{musica.track.name}</span>
                      <span className='artist_name'>{musica.track.artists.map(artists => artists.name)}</span>
                    </div>
                  </div>
                </td>
                <td className='header_album'>
                  <span className="album_name">{musica.track.album.name}</span>
                </td>
                <td className='header_added'>
                  {formatDate(musica.added_at)}<br />
                  {musica.added_at}
                </td>
                <td className='header_time'>
                  {millisToMinutesAndSeconds(musica.track.duration_ms)}
                </td>
              </tr>
              </div>
            )
            })}
          </tbody>
        </table>
      </div>
      <div className="player">
        <SpotifyPlayer 
          token={token}
          uris={uris}
          initialVolume={0.1}
          inlineVolume={true}
          layout='responsive'
          magnifySliderOnHover={true}
          play={true}
          styles={{
            bgColor: "#242424",
            color: "white",
            trackNameColor: "white",
            trackArtistColor: "grey"
          }}
        /> 
      </div>
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
