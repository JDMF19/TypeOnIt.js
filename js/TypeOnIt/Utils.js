
class Utils{

    setAttributesFromString(element, attributesString) {
        // Expresión regular para capturar los pares atributo="valor"
        const regex = /(\w+)=["'](.*?)["']/g;
        let match;
      
        // Buscar todos los atributos en el string
        while ((match = regex.exec(attributesString)) !== null) {
          const attributeName = match[1];  // Nombre del atributo
          const attributeValue = match[2]; // Valor del atributo
          element.setAttribute(attributeName, attributeValue);
        }
    }

    extractHtmlTagsPositions(inputString) {
        const regex = /<([a-zA-Z0-9]+)([^>]*)>|<\/([a-zA-Z0-9]+)>/g; // Modificación para capturar todas las etiquetas
        const result = [];
        let match;
      
        while ((match = regex.exec(inputString)) !== null) {
          if (match[1]) {  // Etiqueta de apertura
            const openingTagEndPosition = regex.lastIndex - 1; // Posición del '>'
      
            result.push({
              tag: match[1],
              attributes: match[2].trim(),
              openingPosition: match.index,
              closingPosition: null, // Aún no tenemos el cierre
              openingTagEndPosition: openingTagEndPosition // Posición del '>'
            });
          } else if (match[3]) {  // Etiqueta de cierre
            const tag = match[3];
            const closingPosition = match.index;
            
            // Buscamos la apertura correspondiente en el resultado
            for (let i = result.length - 1; i >= 0; i--) {
              if (result[i].tag === tag && result[i].closingPosition === null) {
                result[i].closingPosition = closingPosition + tag.length + 3; // Ajustamos el cierre
                break;
              }
            }
          }
        }
      
        return result;
    }

    isValidJQuerySelector(selector) {
        try {
          $(selector);
          return true; 
        } catch (e) {
          return false; 
        }
    }

    range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx)
    }

    sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}