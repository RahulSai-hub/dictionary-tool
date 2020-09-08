const axios = require('axios');
const readline = require('readline');
const env=require('./environmentvariables')
const args=process.argv;
const apirequest=(key, word) => {
    return axios.get(env.host+'word/'+word+`/${key}?api_key=`+env.api_key);
}
const apiReqAsync = (key, word) => {
    return new Promise((resolve, reject) => {
        axios.get(env.host+'word/'+word+`/${key}?api_key=`+env.api_key)
            .then(data=> {
                resolve(data)
            })
            .catch(err => {
                reject(err);
            })
        })
}

const nextpermutations= (word) => {
    if (word.length < 2) 
        return word;
    let permutations = [];
    for (let i=0; i<word.length; i++) {
        let char = word[i];
        if (word.indexOf(char) != i)
            continue;
        const remainingString = word.slice(0,i) + word.slice(i+1, word.length);
        for (let subPermutation of nextpermutations(remainingString))
            permutations.push(char + subPermutation)
    }
    return permutations;
}
const All = (word) => {
    apirequest('definitions',word)
        .then(res =>{
            console.log(`The definitions for the word ${word} are`)
            console.log(definition(res.data));
        })
        .catch(err=> {
            console.log("Sorry Word not found in dictionary")
        })
    apirequest('relatedWords',word)
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
        apirequest('relatedWords',word)
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

            apirequest('examples',word)
            .then(res =>{
                console.log(`The examples for the word ${word} are`)
                console.log(definition(res.data.examples))
            })
            .catch(err=> {
                console.log("Sorry Word not found in dictionary")
            })
}


let definition=(def) => {
    let arr=[];
    for(let i of def) {
        arr.push(i.text);
    }
    return arr;
}



switch(args[2]) {
    case 'def':
        apirequest('definitions',args[3])
            .then(res =>{
                console.log(`Definitions of the word ${args[3]} are`)
                console.log(definition(res.data));
            })
            .catch(err=> {
                console.log("The word you entered was not found in the dictionary")
            })
        break;
    case 'syn':
        apirequest('similarWords',args[3])
            .then(res =>{
                if(res.data.length > 1) {
                    console.log(`The synonyms of  ${args[3]} are`)
                    console.log(JSON.stringify(res.data[1].words));
                } else {
                    console.log(`The synonyms of ${args[3]} are`)
                    console.log(JSON.stringify(res.data[0].words))
                }
            })
            .catch(err=> {
                console.log("The word you entered was not found in the dictionary")
            })
        break;
    case 'ant':
        apirequest('similarWords',args[3])
            .then(res =>{
                if(res.data.length > 1) {
                    console.log(`The antonyms of ${args[3]} are`)
                    console.log(JSON.stringify(res.data[0].words));
                } else {
                    console.log("Sorry We cannot find Antonym of the word in dictionary")
                }
            })
            .catch(err=> {
                console.log("The word you entered was not found in the dictionary")
            })
        break;
    case 'ex':
        apirequest('examples',args[3])
            .then(res =>{
                console.log(`The examples for the word ${args[3]} are`)
                console.log(definition(res.data.examples))
            })
            .catch(err=> {
                console.log("The word you entered was not found in the dictionary")
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