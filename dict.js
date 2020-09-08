const axios = require('axios');
const readline = require('readline');
const env=require('./environmentvariables')
const args=process.argv;
const apirequest=(key, word) => {
    return axios.get(env.host+'word/'+word+`/${key}?api_key=`+env.api_key);
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
        All(arg[3]);
        break;
    case 'play':