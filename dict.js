const axios = require('axios');
const readline = require('readline');

const env = require('./config/env')

const args = process.argv;

const apiReq = (key, word) => {
    return axios.get(env.host+'word/'+word+`/${key}?api_key=`+env.api_key);
}


const nextPermut = (word) => {
    if (word.length < 2) 
        return word;
    let permutations = [];
    for (let i=0; i<word.length; i++) {
        let char = word[i];
        if (word.indexOf(char) != i)
            continue;
        const remainingString = word.slice(0,i) + word.slice(i+1, word.length);
        for (let subPermutation of nextPermut(remainingString))
            permutations.push(char + subPermutation)
    }
    return permutations;
}

const All = (word) => {
    apiReq('definitions',word)
        .then(res =>{
            console.log(`The definitions for the word ${word} are`)
            console.log(definitionArray(res.data));
        })
        .catch(err=> {
            console.log("Sorry Word not found in dictionary")
        })
    apiReq('relatedWords',word)
        .then(res =>{
            if(res.data.length > 1) {
                console.log(`The synonyms for ${word} are`)
                console.log(JSON.stringify(res.data[1].words));
            } else {
                console.log(`The synonyms for ${word} are`)
                console.log(JSON.stringify(res.data[0].words))
            }
        })
        .catch(err=> {
            console.log("Sorry Word not found in dictionary")
        })
        apiReq('relatedWords',word)
            .then(res =>{
                if(res.data.length > 1) {
                    console.log(`The antonyms for ${word} are`)
                    console.log(JSON.stringify(res.data[0].words));
                } else {
                    console.log("Sorry We cannot find Antonym for the word in dictionary")
                }
            })
            .catch(err=> {
                console.log("Sorry Word not found in dictionary")
            })

            apiReq('examples',word)
            .then(res =>{
                console.log(`The examples for the word ${word} are`)
                console.log(definitionArray(res.data.examples))
            })
            .catch(err=> {
                console.log("Sorry Word not found in dictionary")
            })
}

let definitionArray = (def) => {
    let arr = [];
    for(let i of def) {
        arr.push(i.text);
    }
    return arr;
}


switch(args[2]) {
    case 'def':
        apiReq('definitions',args[3])
            .then(res =>{
                console.log(`The definitions for the word ${args[3]} are`)
                console.log(definitionArray(res.data));
            })
            .catch(err=> {
                console.log("Sorry Word not found in dictionary")
            })
        break;
    case 'syn':
        apiReq('relatedWords',args[3])
            .then(res =>{
                if(res.data.length > 1) {
                    console.log(`The synonyms for ${args[3]} are`)
                    console.log(JSON.stringify(res.data[1].words));
                } else {
                    console.log(`The synonyms for ${args[3]} are`)
                    console.log(JSON.stringify(res.data[0].words))
                }
            })
            .catch(err=> {
                console.log("Sorry Word not found in dictionary")
            })
        break;
    case 'ant':
        apiReq('relatedWords',args[3])
            .then(res =>{
                if(res.data.length > 1) {
                    console.log(`The antonyms for ${args[3]} are`)
                    console.log(JSON.stringify(res.data[0].words));
                } else {
                    console.log("Sorry We cannot find Antonym for the word in dictionary")
                }
            })
            .catch(err=> {
                console.log("Sorry Word not found in dictionary")
            })
        break;
    case 'ex':
        apiReq('examples',args[3])
            .then(res =>{
                console.log(`The examples for the word ${args[3]} are`)
                console.log(definitionArray(res.data.examples))
            })
            .catch(err=> {
                console.log("Sorry Word not found in dictionary")
            })
        break;
    case 'dict':
        All(args[3]);
        break;
     
    case undefined:
        axios.get(env.host+'words/randomWord?api_key='+env.api_key)
            .then(res =>{
                All(res.data.word)
            })
            .catch(err=> {
                console.log("Sorry Word not found in dictionary")
            })
        break;
    default:
        All(args[2])   
}
