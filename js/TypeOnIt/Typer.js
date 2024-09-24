

class Typer extends Utils{

    instance = null;
    phrase = null;
    element = null;
    cursor = null;
    cursorCurrentPosition = -1;
    typing = false;
    isDestroyed = false;

    options = {}
    callbacks = {}
    deeps = []

    constructor(instance, element, options = {}, callbacks = {}){

        super()

        this.instance = instance
        this.element = element
        this.options = options
        this.callbacks = callbacks

        this.#initCursor()

    }

    setPhrase(phrase){
        this.phrase = phrase
    }

    getPhrase(){
        return this.phrase
    }

    async start(){

        if(this.isDestroyed) return;

        if(this.phrase === null){
            throw new Error('TypeOnIt: No hay una frase para escribir')
        }
      
        if(this.callbacks.beforeString.constructor.name === 'AsyncFunction'){
            await this.callbacks.beforeString(this.instance)
        }else{
            this.callbacks.beforeString(this.instance)
        }


        for (let index = 0; index < this.phrase.strings.length; index++) {
            const string = this.phrase.strings[index];
            await this.type(string)
        }


        if(this.callbacks.afterString.constructor.name === 'AsyncFunction'){
            await this.callbacks.afterString(this.instance)
        }else{
            this.callbacks.afterString(this.instance)
        }

        if(this.phrase.options.delay){
            await this.sleep(this.phrase.options.delay)
        }

        await this.phrase.end()

    }

    async type(string){

        if(this.isDestroyed) return;

        this.typing = true

        this.animateCursor(false)
        let htmlTags = this.extractHtmlTagsPositions(string)
        let ignorePositions = [];


        for (let index = 0; index < string.length; index++) {

            let infoTag = htmlTags.find(tag => tag.openingPosition === index)
       

            if(infoTag){
                let tag = document.createElement(infoTag.tag)
                this.setAttributesFromString(tag, infoTag.attributes)
                this.cursor.after(tag)
                this.#replaceCursor().appendTo(tag)

                ignorePositions = ignorePositions.concat(this.range(infoTag.openingPosition, infoTag.openingTagEndPosition))


                let lengthClosingTag = infoTag.tag.length + 3
                ignorePositions = ignorePositions.concat(this.range(infoTag.closingPosition - lengthClosingTag, infoTag.closingPosition - 1))

                infoTag.domTag = tag

                this.deeps.push(infoTag)

            }


            const char = string[index];
            if(ignorePositions.includes(index)){
                continue;
            }


            let parent = this.deeps[this.deeps.length - 1]
            if(parent && parent.closingPosition === index){
                this.#replaceCursor().insertAfter(parent.domTag)
                this.deeps.pop()
            }


            if(this.callbacks.beforeStep.constructor.name === 'AsyncFunction'){
                await this.callbacks.beforeStep(this.instance)
            }else{
                this.callbacks.beforeStep(this.instance)
            }

            $(`<span class="type-on-it-text">${char}</span>`).insertBefore(this.cursor)
            this.#changeCursorCurrentPosition(this.cursorCurrentPosition + 1)
            await this.sleep(this.phrase.options.speed)


            if(this.callbacks.afterStep.constructor.name === 'AsyncFunction'){
                await this.callbacks.afterStep(this.instance)
            }else{
                this.callbacks.afterStep(this.instance)
            }

        }

        let parent = this.deeps[this.deeps.length - 1]
        if(parent){
            this.#replaceCursor().insertAfter(parent.domTag)
            this.deeps.pop()
        }

        this.typing = false
        this.animateCursor(true)

    }

    #initCursor(){
        this.cursor = this.#createCursor()
        this.animateCursor()
        this.element.append(this.cursor)
    }

    #createCursor(){
        return $(`<span class="type-on-it-cursor">${this.options.char}</span>`)
    }

    #replaceCursor(){
        let newCursor = this.#createCursor()
        this.cursor.remove()
        this.cursor = newCursor
        return this.cursor
    }

    animateCursor(animate = true){

        if(!this.cursor) return;

        if(animate){
            this.cursor.addClass("animate")
        }else{
            this.cursor.removeClass("animate")
        }

    }

    #changeCursorCurrentPosition(position){
        this.cursorCurrentPosition = position
    }

    async #updateCursorPosition(position, options = {}){

        if(position === null && !options.to){
            throw new Error('TypeOnIt: No puedes mover el cursor a una posición nula')
        }

        if(position === null && options.to.toLowerCase() === 'start'){
            position = 0
        }
         
        if((position === null && options.to.toLowerCase() === 'end') || (position > this.element.find(".type-on-it-text").length - 1)){
            position = this.element.find(".type-on-it-text").length - 1
        }


        let diff = position - this.cursorCurrentPosition
       
        if(options.instant){
            
            let span = this.element.find(".type-on-it-text")[position]

            if(!span){
                this.#replaceCursor().appendTo(this.element)
                this.#changeCursorCurrentPosition(this.element.find(".type-on-it-text").length - 1)

            }else {
                if(diff > 0){ 
                    this.#replaceCursor().insertAfter(span)
                }else{
                    this.#replaceCursor().insertBefore(span)
                }
                this.#changeCursorCurrentPosition(position)
            }

            return;
        }


        if(diff > 0){ // Mover a la derecha

            for (let index = 0; index < Math.abs(diff); index++) {
                
                let spanAfter = this.cursor.next(".type-on-it-text")
                
                this.#replaceCursor().insertAfter(spanAfter)
                this.#changeCursorCurrentPosition(this.cursorCurrentPosition + 1)
                if(!this.typing){
                    await this.sleep(options.speed ?  options.speed : this.options.speed)
                }
               

            }
            
        }else if(diff < 0){ // Mover a la izquierda
            for (let index = 0; index < Math.abs(diff); index++) {
                
                let spanBefore = this.cursor.prev(".type-on-it-text")

                this.#replaceCursor().insertBefore(spanBefore)
                this.#changeCursorCurrentPosition(this.cursorCurrentPosition - 1)
                if(!this.typing){
                    await this.sleep(options.speed ?  options.speed : this.options.speed)
                }

            }
        }
        
    }

    async moveCursor(position, options = {}){
        if(this.typing){
            throw new Error('TypeOnIt: No puedes mover el cursor mientras se escribe')
        }

        if(options.delay){
            await this.sleep(options.delay)
        }

        await this.#updateCursorPosition(position, options)
    }

    async delete(characters = 1, options = {}){

        if(characters === null){
            characters = this.element.children(".type-on-it-text").length
            options.instant = true
        }

        if(typeof characters == "string" && this.isValidJQuerySelector(characters)){
            let el = this.element.find(characters)
            if(el.length === 0){
                throw new Error('TypeOnIt: El selector no existe')
            }

            characters = el.find(".type-on-it-text").length
            this.#changeCursorCurrentPosition(this.cursorCurrentPosition - characters)
            el.remove()
            return;

        }


        for (let index = Math.abs(characters); index > 0 ; index--) {

            let span = this.cursor.prev(".type-on-it-text")

            if(span.length === 0){
                break;
            }

            span.remove()
            this.#changeCursorCurrentPosition(this.cursorCurrentPosition - 1)
            if(!options.instant){
                await this.sleep(options.speed ?  options.speed : this.options.speed)
            }
        
        }

    }

    async breakLine(options = {}){

        if(options.delay){
            await this.sleep(options.delay)
        }

        $(`<br>`).insertBefore(this.cursor)

    }
    
    reset(){
        this.element.html("")
        this.cursor.remove()
        this.typing = false
        this.cursor = null
        this.#changeCursorCurrentPosition(-1)
        this.deeps = []
        this.#initCursor()
    }

    destroy(){
        this.cursor.remove()
        this.typing = false
        this.cursor = null
        this.#changeCursorCurrentPosition(-1)
        this.isDestroyed = true
    }
    

}