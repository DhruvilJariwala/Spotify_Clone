
let currentsong= new Audio();
let song;
let currFolder;
let vol;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
      return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs(folder){
    currFolder=folder
    let a = await fetch(`/${currFolder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML=response;
    let links=div.getElementsByTagName("a")
    let songs=[]
    
    for (let index = 0; index < links.length; index++) {
        const element = links[index];
            if(element.href.endsWith(".mp3")){
                songs.push(element.href.split(`/${currFolder}/`)[1])
            }
    }

    let songul= document.querySelector(".songlist").getElementsByTagName("ul")[0] 
    songul.innerHTML=""
    playMusic(songs[0],true)
    for (const song of songs) {
      let a1= await fetch(`/${currFolder}/metadata.json`)
      let r1= await a1.json()
      let artist1
      for(i=0;i<r1.length;i++){
        if(r1[i].title==song.replaceAll("%20"," ").replaceAll(".mp3","")){artist1=r1[i].artist
        }
      }
        songul.innerHTML=songul.innerHTML+`
        <li><img  class="invert" src="icons/music.svg" alt="">
              <div class="info">
                <div >${song.replaceAll("%20"," ").replaceAll(".mp3","")}</div>
                <div>${artist1}</div>
              </div>
              <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="icons/play.svg" alt="">
              </div>
            </li>`;
    }   
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
      e.addEventListener("click",element=>{
          playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
      })

    })
    
   return songs
}

const playMusic=(track,pause=false)=>{
  if(!track.endsWith(".mp3")){
    currentsong.src=`/${currFolder}/`+ track +".mp3"
  }
  else{
    currentsong.src=`/${currFolder}/`+ track 
  }
  if(!pause){
    currentsong.play()
    play.src="icons/pause.svg"
  }
  document.querySelector(".songinfo").innerHTML=track.replaceAll(".mp3","").replaceAll("%20"," ")
  document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`

}

async function displayalbums(){
  let a = await fetch(`/Songs`)
    let response = await a.text()
   
    let div = document.createElement("div")
    let cardcontainer = document.querySelector(".card-container")
    div.innerHTML=response;
    let anchors = div.getElementsByTagName("a")
    let array=Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      if(e.href.includes("/Songs")){
        let folder=e.href.split(`/`).slice(-2)[0]
        if(folder!="Songs"){
        let a = await fetch(`Songs/${folder}/info.json`)
        let response = await a.json()
        cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card">
        <div class="play">
          <img src="icons/play-button-green-icon.svg" alt="">
        </div>
        <img src="/Songs/${folder}/cover.jpg" alt="${response.Description}">
        <h5>${response.heading}
        </h5>
       <p>${response.Description}</p>
      </div>`}
    
      }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
      e.addEventListener("click",async item=>{
       song = await getsongs(`Songs/${item.currentTarget.dataset.folder}`)
       playMusic(song[0],true)
       if(play.src="icons/pause.svg"){
        play.src="icons/play.svg"
      }
      })
    })

    
}
async function main(){
  song= await getsongs("Songs/JD")
  playMusic(song[0],true) 

  displayalbums()

    
  play.addEventListener("click",e=>{
    if(currentsong.paused){
      currentsong.play()
      play.src="icons/pause.svg"
    }
    else{
      currentsong.pause();
      play.src="icons/play.svg"
    }
  })
  currentsong.addEventListener("timeupdate",()=>{
   
    document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
    document.querySelector(".circle").style.left=((currentsong.currentTime/currentsong.duration)*100)-1+"%"
    
  })
  document.querySelector(".seekbar").addEventListener("click", e=>{
    let percent= ((e.offsetX/e.target.getBoundingClientRect().width)*100)
    document.querySelector(".circle").style.left=percent+"%"
    currentsong.currentTime=((currentsong.duration)*percent)/100
 
  })

  document.querySelector(".hamburger").addEventListener("click",()=>{
    document.querySelector(".left").style.left="0%"
  })

  document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left="-150%"
  })
 

  prev.addEventListener("click",()=>{
    let folder=currentsong.src.split("/").slice(-2)[0]
    let index=song.indexOf(currentsong.src.split(`/${folder}/`)[1])
    if([index-1]>=0){
      playMusic(song[index-1].replaceAll("%20"," "))
    }
  })
  next.addEventListener("click",()=>{
    let folder=currentsong.src.split("/").slice(-2)[0]
    let index=song.indexOf(currentsong.src.split(`/${folder}/`)[1])
    if([index+1]<song.length){
      playMusic(song[index+1].replaceAll("%20"," "))
    }
  })

  document.querySelector(".slider").addEventListener("change",(e)=>{
    vol=e.target.value;
    currentsong.volume=parseInt(e.target.value)/100
  })

  Array.from(document.getElementsByClassName("card")).forEach(e=>{
    e.addEventListener("click",async item=>{
     song = await getsongs(`Songs/${item.currentTarget.dataset.folder}`)
    })
  })
  document.querySelector(".vol").addEventListener("click",(e)=>{
    if(e.target.src.includes("volume.svg")){
      e.target.src=e.target.src.replace("volume.svg","mute.svg")
    currentsong.volume=0;
    document.querySelector(".slider").value =  0;
  }else{
    e.target.src=e.target.src.replace("mute.svg","volume.svg")
   currentsong.volume=0.5;
   document.querySelector(".slider").value = 50
  }
  })
  function pn(){
    if(!currentsong.paused && secondsToMinutesSeconds(currentsong.duration)!="00:00"){
      if(secondsToMinutesSeconds(currentsong.currentTime)==secondsToMinutesSeconds(currentsong.duration)){
        let folder=currentsong.src.split("/").slice(-2)[0]
        let index=song.indexOf(currentsong.src.split(`/${folder}/`)[1])
        if([index+1]<song.length){
       playMusic(song[index+1].replaceAll("%20"," "))
      }}}
  }
  setInterval(pn,1000)
  
}
main() 
