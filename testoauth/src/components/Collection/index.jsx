import { useState } from "react";
import SpotifyPlayer from 'react-spotify-web-playback';
import {BsFillPlayFill, BsSoundwave } from 'react-icons/bs'
import {BiPause} from 'react-icons/bi'

function Collection({token, uris, musics, setSelected, authLink}){

    const [hover, setHover] = useState({i: null, hover: null})
    const [play, setPlay] = useState(true)


    function millisToMinutesAndSeconds(millis) {
      var minutes = Math.floor(millis / 60000);
      var seconds = ((millis % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
  
    function formatDate(undate){
      const date = new Date(undate)
      const today = new Date()
      const timeDiff = Math.abs(today.getTime() - date.getTime());
      const diferenca = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
  
      const semanas = Math.floor(diferenca/7)
      if( semanas < 4){
        return semanas > 1 ? `Há ${semanas} semanas` :  `Há ${semanas} semana`
      }
      const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out" ,"nov", "dez"]
  
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
                onMouseEnter={() => {
                  hover.current == musica.track.uri && play ? setHover({i: i, hover: 'pause', current: uris }) : 
                  setHover({i: i, hover: <BsFillPlayFill onClick={() => {setPlay(true)}}/>, current:  uris})}}
                onMouseLeave={() => {setHover({i: null, hover: null})}}
                >
                  <tr>
                  <td className='play_button header_button'>
                    <button onClick={() => {
                      setSelected([musica.track.uri])
                    }} key={i} id={i} >
                      { 
                      hover.hover === 'pause' && hover.i === i  ? <BiPause onClick={() => setPlay(!play)}/> :
                       uris == musica.track.uri && play ? <BsSoundwave color="green" /> : 
                       uris == musica.track.uri && !play ? hover.i === i ? hover.hover : <p style={{color: 'green'}}> { i + 1} </p> :
                       hover.i === i ? hover.hover : i + 1  
                       }
                    </button>
                  </td>
                  <td className='header_title'>
                    <div className="music_infos">
                      <div className="img">
                        <img src={musica.track.album.images[2].url} alt={musica.track.name}/>
                      </div>
                      <div className="music_title_artits">
                        <span className={`music_name ${musica.track.uri == uris ? 'paused' : ''}`}>{musica.track.name}</span>
                        <span className='artist_name'>{musica.track.artists.map(artists => artists.name + ' ')}</span>
                      </div>
                    </div>
                  </td>
                  <td className='header_album'>
                    <span className="album_name">{musica.track.album.name}</span>
                  </td>
                  <td className='header_added'>
                    {formatDate(musica.added_at)}<br />
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
            play={play}
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

export default Collection