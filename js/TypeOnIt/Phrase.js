

class Phrase {

    strings = []
    options = {
        speed: 100,
        delay: 0,
        queue : []
    }

    constructor (strings, options = {}){
        this.strings = strings;
        this.options = {...this.options, ...options}
    }

    async end(){

        for (let index = 0; index < this.options.queue.length; index++) {
            const action = this.options.queue[index];

            if(typeof action === 'function'){
                await action()
            }
        }

    }

}