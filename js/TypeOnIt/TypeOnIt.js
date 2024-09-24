

class TypeOnIt {

    element = null; // Elemento donde se implementa la escritura
    phrases = [];
    typer = null;
    isStarted = false;

    options = {
        speed: 100,
        startDelay: 0,
        loop: false,
        loopDelay: 600,
        cursor: {
            char: '|',
            speed: 60,
        },
        beforeString: () => null,
        afterString: () => null,
        beforeStep: () => null,
        afterStep: () => null,
        afterComplete: () => null,
    }

    constructor (selector, options = {}){

        if(options.cursor){
            options.cursor = {...this.options.cursor, ...options.cursor}
        }

        this.options = {...this.options, ...options}

        if(typeof selector === 'string'){
            this.element = $(selector)
        }else if(selector instanceof jQuery){
            this.element = selector
        }

        if(['input', 'textarea'].includes(this.element.prop('tagName').toLowerCase())){
            throw new Error('TypeOnIt: No se puede implementar en elementos de tipo input o textarea')
        }

        this.typer = new Typer(this, this.element, this.options.cursor, {
            beforeString: this.options.beforeString,
            afterString: this.options.afterString,
            beforeStep: this.options.beforeStep,
            afterStep: this.options.afterStep
        })

        if(options.strings){
            this.type(options.strings)
        }


    }

    getElement(){
        return this.element[0]
    }

    go(){

        if(this.isStarted) return;

        this.#start()

        return this
    }

    async #start(){

        if(this.options.startDelay){
            await this.typer.sleep(this.options.startDelay)
        }

        this.isStarted = true

        for (let index = 0; index < this.phrases.length; index++) {
            const phrase = this.phrases[index];
            this.typer.setPhrase(phrase)
            await this.typer.start()
        }

        this.isStarted = false
        this.options.afterComplete(this)

        if(this.options.loop && this.typer.isDestroyed === false){
            await this.typer.sleep(this.options.loopDelay)
            this.reset()
            this.go()
        }

    }

    type(string, options = {}){

        let {speed, delay} = this.options
        options = {...options, speed, delay}

        let array_strings = typeof string === 'string' ? [string] : string
        this.phrases.push(new Phrase(array_strings, options))

        return this
    }

    move(position, options = {}){

        if(this.typer.typing) return this

        this.phrases[this.phrases.length - 1].options.queue.push(async () => {

            let p = position

            if(p !== null){
                p = this.typer.cursorCurrentPosition + p
            }

            await this.typer.moveCursor(p, options)
        }) 

        return this
    }

    delete(characters, options = {}){
        
        if(this.typer.typing) return this

        this.phrases[this.phrases.length - 1].options.queue.push(async () => {
            let c = characters
            await this.typer.delete(c, options)
        }) 

        return this

    }

    pause(ms){

        if(this.typer.typing) return this
    
        this.phrases[this.phrases.length - 1].options.queue.push(async () => {
            this.typer.animateCursor()
            await this.typer.sleep(ms)
        })

        return this

    }

    exec(func){
            
        if(this.typer.typing) return this

        this.phrases[this.phrases.length - 1].options.queue.push(async () => {
            if(func.constructor.name === 'AsyncFunction'){
                await func(this)
            }else{
                func(this)
            }

        })

        return this
    }

    break(options = {}){
            
        if(this.typer.typing) return this

        this.phrases[this.phrases.length - 1].options.queue.push(async () => {
            await this.typer.breakLine(options)
        })

        return this

    }

    reset(){
        this.typer.reset()
    }

    destroy(){
        this.typer.destroy()
    }

  
   

}