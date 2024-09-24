new TypeOnIt("#hero", {
          loop: true,
           
          })
          .type("¡Suscríbete a mi canal para más contenido! :)")
          .break()
          .type(`<em>- <strong>AnotherCodeChannel</strong></em>`)
          .go();
  
function getRandomColor(){
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
}