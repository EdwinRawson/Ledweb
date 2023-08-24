window.addEventListener('load', iniciarReproductor);

let idFrame, listadoCanciones = ['Walking in the long sudwest (english)','Lick', 'Rules End (normalized)','Una Chispa'];
let icono = [], uris = {musica: 'Musica/', caratula: 'Caratula/'}, reproduciendo = 0;
let cancion = {
  audio: new Audio(),
  URI: '',
  caratula:'',
  duracion:''
};
let reproductor = {
  nodo: '',
  duracion: '',
  caratula: '',
  deslizador: [],
  boton: []
};

icono['pausa'] = 'fa-pause', icono['reproducir'] = 'fa-play',
icono['volumenSilenciado'] = 'fas fa-volume-mute', icono['volumenBajo'] = 'fas fa-volume-down',
icono['volumenAlto'] = 'fas fa-volume-up';

function iniciarReproductor(){
  reproductor.boton['reproducirPausa'] = document.querySelector('.controles__reproduccion .' + icono['reproducir']).parentElement;
  reproductor.boton['cancionSiguiente'] = document.querySelector('.controles__reproduccion .fa-step-forward').parentElement;
  reproductor.boton['cancionAnterior'] = document.querySelector('.controles__reproduccion .fa-step-backward').parentElement;
  reproductor.boton['volumen'] = document.querySelector('.controles__volumen button');
  reproductor.deslizador['volumen'] = document.querySelector('.controles__volumen input');
  reproductor.deslizador['progresoCancion'] = document.querySelector('.reproduccion__progreso input');

  reproductor.caratula = document.querySelector('.cancion__caratula img');
  reproductor.duracion = document.querySelector('.reproduccion__progreso time');
  reproductor.nodo = document.querySelector('.reproductor');

  reproductor.boton['reproducirPausa'].addEventListener('click', alternarReproduccion);
  reproductor.boton['cancionSiguiente'].addEventListener('click', () => cargarCancion(1));
  reproductor.boton['cancionAnterior'].addEventListener('click', () => cargarCancion(-1));
  reproductor.boton['volumen'].addEventListener('click', alternarDeslizadorVolumen);
  document.addEventListener('click', alternarDeslizadorVolumen);
  reproductor.deslizador['volumen'].addEventListener('input', moverVolumen);
  reproductor.deslizador['progresoCancion'].addEventListener('input', moverProgreso);

  reproductor['caratula'].style.animationPlayState = 'paused';

  cargarCancion(reproduciendo);
}

function moverProgreso(e){
  let momento = e.target.value;
  cancion.audio.fastSeek(momento);
}

function cargarCancion(sentido){
  let cambiarA = reproduciendo + sentido;
  reproductor.caratula.classList.add('oculto');

  if(cambiarA >= listadoCanciones.length) reproduciendo = 0;
  else if(cambiarA < 0) reproduciendo = listadoCanciones.length - 1;
  else reproduciendo = cambiarA;

  cancion.URI = uris.musica + listadoCanciones[reproduciendo] + '.mp3';
  cancion.caratula = uris.caratula + listadoCanciones[reproduciendo] + '.jpg';
  cancion.audio.src = cancion.URI;
  
  reproductor.caratula.src = cancion.caratula;
  reproductor.caratula.classList.remove('oculto');

  reproductor.deslizador['progresoCancion'].value = 0;

  setTimeout( () => cambiarCancion(), 1000);
}

function cambiarCancion(){
  cancion.duracion = duracionCancion(cancion.audio.duration);

  reproductor.duracion.innerText = `00:00/${cancion.duracion.minutos}:${cancion.duracion.segundos}`;
  reproductor.deslizador['progresoCancion'].max = cancion.audio.duration;

  document.querySelector('.cancion__titulo').innerText = listadoCanciones[reproduciendo];

  if(reproductor.boton['reproducirPausa'].firstChild.classList.contains(icono['pausa'])) cancion.audio.play();
}

function duracionCancion(duracionS){
  let minutos, segundos;
  minutos = Math.floor(duracionS/60).toString().padStart(2, '0');
  segundos = Math.floor(duracionS - minutos*60).toString().padStart(2, '0');

  return({minutos, segundos});
}

function actualizarReproductor(){
  idFrame = requestAnimationFrame(actualizarReproductor);

  let momentoActual = duracionCancion(cancion.audio.currentTime);
  reproductor.duracion.innerText = `${momentoActual.minutos}:${momentoActual.segundos}/${cancion.duracion.minutos}:${cancion.duracion.segundos}`;

  reproductor.deslizador['progresoCancion'].value = cancion.audio.currentTime;

  //Si terminó la canción, cambiar a la siguiente.
  if(cancion.audio.currentTime == cancion.audio.duration) cargarCancion(1);
}

function alternarReproduccion(){
  let pausar = reproductor.boton['reproducirPausa'].firstChild.classList.toggle(icono['reproducir']);
  reproductor.boton['reproducirPausa'].firstChild.classList.toggle(icono['pausa']);

  if(!pausar){
    idFrame = requestAnimationFrame(actualizarReproductor);
    cancion.audio.play();
    reproductor['caratula'].style.animationPlayState = 'running';
    reproductor.nodo.classList.add('reproduciendo');
  } else {
    window.cancelAnimationFrame(idFrame);
    cancion.audio.pause();
    reproductor['caratula'].style.animationPlayState = 'paused';
    reproductor.nodo.classList.remove('reproduciendo');
  }
}

function alternarDeslizadorVolumen(e){
  e.stopPropagation();
  if(e.target == reproductor.boton['volumen'] || e.target == reproductor.boton['volumen'].firstChild){
    reproductor.deslizador['volumen'].classList.toggle('oculto');
  } else {
    reproductor.deslizador['volumen'].classList.add('oculto');
  }
}

function moverVolumen(e){
  let volumen = e.target.value;

  cancion.audio.volume = volumen/100;

  let iconoVolumen = reproductor.boton['volumen'].querySelector('i');

  if(volumen == 0) iconoVolumen.className = icono['volumenSilenciado'];
  else if(volumen <= 50) iconoVolumen.className = icono['volumenBajo'];
  else iconoVolumen.className = icono['volumenAlto'];
}