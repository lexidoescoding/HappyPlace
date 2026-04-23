import { readFile } from 'fs/promises';
import {join} from "node:path";

let index = 0

let variables: Map<string, any> = new Map()

const text = (await readFile(join(import.meta.dirname, '../externalFiles/test.hp'), 'utf-8')).replace(/\r/g, '')

function getWord(text: string) {
    while (index < text.length && (text[index] === " " || text[index] === "\n")) {
        index++
    }
    let word = ""
    while (index < text.length) {
        if (text[index] === " " || text[index] === "\n") {
            index++
            break
        }
        word += text[index]
        index++
    }
    return word
}

function getString(text: string) {
    let result = ''
    index++ // skip opening "
    while (index < text.length) {
        if (text[index] === '"') {
            index++ // skip closing "
            break
        }
        result += text[index]
        index++
    }
    return result
}

function runOnce(currentWord: string) {
    switch (currentWord) {
        case "set":{
            const variableName = getWord(text)
            currentWord = getWord(text)
            switch(currentWord) {
                case "text": {
                    variables.set(variableName, getString(text))
                    break
                }
                case "number": {
                    currentWord = getWord(text)
                    variables.set(variableName, Number(currentWord))
                    break
                }
            }
            break
        }
        case "delete":{
            const variableName = getWord(text)
            variables.delete(variableName)
            break
        }
        case "print":{
            const currentWord = getWord(text)
            if (currentWord[0] === "\"") {
                console.log(currentWord.slice(1, -1))
            }
            else {
                console.log(variables.get(currentWord))
            }
            break
        }
        case "loop": {
            const loopAmount = Number(getWord(text))
            const loopCounter = getWord(text)
            const loopStart = index
            let loopEnd = 0
            for (let i = 0; i < loopAmount; i++) {
                variables.set(loopCounter, i)
                currentWord = getWord(text)
                while (currentWord !== "endLoop") {
                    runOnce(currentWord)
                    currentWord = getWord(text)
                }
                loopEnd = index
                index = loopStart
            }
            index = loopEnd
        }

    }
}

while (index < text.length) {
    const currentWord = getWord(text)
    runOnce(currentWord)
}
