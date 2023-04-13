import { useEffect, useState } from 'react';
import {Routes, Route, useLocation, useNavigate} from 'react-router-dom'
import './App.css';

import Collection from './components/Collection';

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
        <Route path='/' element={
          <Collection
            token={token} 
            uris={selectedMusic} 
            musics={musics} 
            setSelected={ (e) => setSelected(e)}
            authLink = {authLink}
          />} />
        <Route path='/callback' element={<Callback />}/>
      </Routes>
  );
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
