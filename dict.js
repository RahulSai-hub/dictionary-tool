

const axios = require('axios');
const readline = require('readline');
const prompt=require('prompt');
const env = require('./environmentvariables')

const args = process.argv;
let score=0;

const apiRequest = (key, word) => {
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
const nextPermutations = (word) => {
    if (word.length < 2) 
        return word;
    let permutations = [];
    for (let i=0; i<word.length; i++) {
        let char = word[i];
        if (word.indexOf(char) != i)
            continue;
        const remainingString = word.slice(0,i) + word.slice(i+1, word.length);
        for (let subPermutation of nextPermutations(remainingString))
            permutations.push(char + subPermutation)
    }
    return permutations;
}

const All = (word) => {
    apiRequest('definitions',word)
        .then(res =>{
            console.log(`The definitions of the word ${word} are`)
            console.log(definition(res.data));
        })
        .catch(err=> {
            console.log("The word you enetered was not found in the dictionary")
        })
    apiRequest('relatedWords',word)
        .then(res =>{
            if(res.data.length > 1) {
                console.log(`The synonyms of ${word} are`)
                console.log(JSON.stringify(res.data[1].words));
            } else {
                console.log(`The synonyms of ${word} are`)
                console.log(JSON.stringify(res.data[0].words))
            }
        })
        .catch(err=> {
            console.log("The word you enetered was not found in the dictionary")
        })
        apiRequest('relatedWords',word)
            .then(res =>{
                if(res.data.length > 1) {
                    console.log(`The antonyms for ${word} are`)
                    console.log(JSON.stringify(res.data[0].words));
                } else {
                    console.log("Sorry We cannot find Antonym for the word in dictionary")
                }
            })
            .catch(err=> {
                console.log("The word you enetered was not found in the dictionary")
            })

            apiRequest('examples',word)
            .then(res =>{
                console.log(`The examples for the word ${word} are`)
                console.log(definition(res.data.examples))
            })
            .catch(err=> {
                console.log("The word you enetered was not found in the dictionary")
            })
}

let definition = (def) => {
    let arr = [];
    for(let i of def) {
        arr.push(i.text);
    }
    return arr;
}


switch(args[2]) {
    case 'def':
        apiRequest('definitions',args[3])
            .then(res =>{
                console.log(`The definitions for the word ${args[3]} are`)
                console.log(definition(res.data));
            })
            .catch(err=> {
                console.log("The word you enetered was not found in the dictionary")
            })
            console.log(args[3]);
        break;
    case 'syn':
        apiRequest('relatedWords',args[3])
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
                console.log("The word you enetered was not found in the dictionary")
            })
        break;
    case 'ant':
        apiRequest('relatedWords',args[3])
            .then(res =>{
                if(res.data.length > 1) {
                    console.log(`The antonyms for ${args[3]} are`)
                    console.log(JSON.stringify(res.data[0].words));
                } else {
                    console.log("Sorry We cannot find Antonym for the word in dictionary")
                }
            })
            .catch(err=> {
                console.log("The word you enetered was not found in the dictionary")
            })
        break;
    case 'ex':
        apiRequest('examples',args[3])
            .then(res =>{
                console.log(`The examples for the word ${args[3]} are`)
                console.log(definition(res.data.examples))
            })
            .catch(err=> {
                console.log("The word you enetered was not found in the dictionary")
            })
        break;
    case 'dict':
        All(args[3]);
        break;
    case 'play':
            const readlineInterface = readline.createInterface(process.stdin, process.stdout);
            const input = (questionText) => {
                return new Promise((resolve, reject) => {
                readlineInterface.question(questionText, resolve);
                });
            }
            axios.get(env.host+'words/randomWord?api_key='+env.api_key)
                .then(res =>{
                    const word = res.data.word;
                    let allPermut = [];
                    let permutations = nextPermutations(word);
                    for (permutation of permutations)
                        allPermut.push(permutation);
                    apiRequest('definitions', word)
                        .then(async res =>{
                            const def = res.data;
                            let wordDefIndex = 0;
                            console.log(def[wordDefIndex++].text)
                            let relatedWords = await apiReqAsync('relatedWords', word);
                            let synonyms, antonyms;
                            if(relatedWords.data.length > 1) {
                                antonyms = relatedWords.data[0].words;
                                synonyms = relatedWords.data[1].words; 
                            } else {
                                synonyms = relatedWords.data[0].words;
                            }
                            let synonymIndex = 0, antonymIndex = 0;
                            let inputword = await input("Can You guess this word? \n")
                            if(inputword === word) {
                                console.log("Good Job"); 
                                score=score+10;
                                console.log("current score is:"+score);
                                //process.exit();
                            } else {
                                let flag = 0;
                                while(true) {
                                    if(flag === 1) {
                                        break;
                                    } else {
                                        console.log("Enter 1 to try again, 2 for hint, 3 to view answer and 4 to quit");
                                        let choice = await input('');
                                        let wordinput;
                                        choice = Number(choice);
                                        switch(choice) {
                                            case 1:
                                                console.log("Let's try again");
                                                wordinput = await input("Enter Your Word again\n");
                                                if(word === wordinput) {
                                                    console.log("Great Job Finally!!")
                                                    flag=1;
                                                    //process.exit();
                                                } else {
                                                    console.log("That's incorrect.")
                                                            score=score-2;
                                                            console.log("current score is:"+score);
                                                }
                                                break;
                                            case 2: 
                                                console.log("Lets see what we have for hint");
                                                score=score-3;
                                                let hint = (antonyms === undefined || antonyms[antonymIndex] === undefined)?Math.floor(Math.random()*3+1):Math.floor(Math.random()*4+1);
                                                
                                                switch(hint) {
                                                    case 1: 
                                                        console.log("The Words are Jumbled can you guess it right?");
                                                        const randPermut = Math.floor(Math.random()*allPermut.length + 1);
                                                        console.log(allPermut[randPermut]);
    
                                                        wordinput = await input("Enter Your Word again\n");
                                                        if(word === wordinput) {
                                                            console.log("Good Job Finally!!")
                                                            flag = 1;
                                                            //process.exit();
                                                        } else {
                                                            console.log("That's incorrect.")
                                                        }
                                                        break;
                                                    case 2: 
                                                        console.log("Let's see if you can get the word from another definition of the word?");
                                                        console.log(def[wordDefIndex++].text);
                                                        wordinput = await input("Enter Your Word again\n");
                                                        if(word === wordinput) {
                                                            console.log("Good Job Finally!!")
                                                            flag = 1;
                                                            //process.exit();
                                                        } else {
                                                            console.log("That's incorrect.")
                                                        }
                                                        break;
                                                    case 4:
                                                        console.log('Given are the antonyms of the word. Can you guess it now?')
                                                        
                                                        console.log(antonyms[antonymIndex++])
                                                        wordinput = await input("Enter Your Word again\n");
                                                        if(word === wordinput) {
                                                            console.log("Good Job Finally!!")
                                                            flag = 1;
                                                            //process.exit();
                                                        } else {
                                                            console.log("That's incorrect.")
                                                        }
                                                        break;
                                                    case 3: 
                                                        console.log('Given are the synonyms of the word. Can you guess it now?')
                                                        
                                                        console.log(synonyms[synonymIndex++])
                                                        wordinput = await input("Enter Your Word again\n");
                                                        if(word === wordinput) {
                                                            console.log("Good Job Finally!!")
                                                            flag = 1;
                                                            //process.exit();
                                                        } else {
                                                            console.log("That's incorrect.")
                                                        }   
                                                       break;
                                                }
                                                break;
                                            case 3: 
                                                //flag  = 1;
                                                
                                                
                                                console.log("Right answer is:"+word);  
                                                score=score-4;
                                                console.log("current score is:"+score);
                                                let rightanswer=word;
                                                All(rightanswer);
                                                //console.log("enter the answer to get full datials for that answer");
                                                //const args1=process.argv[rightanswer];
                                                //console.log(args1);
                                                /*prompt.start();
                                                prompt.get(['keyword'],function(err,result){
                                                    if(err){
                                                        return onErr(err);
                                                    }
                                                    switch(result.keyword) {
                                                        case 'def':
                                                            apiReq('definitions',args[3])
                                                                .then(res =>{
                                                                    console.log(`The definitions for the word ${args[3]} are`)
                                                                    console.log(definitionArray(res.data));
                                                                })
                                                                .catch(err=> {
                                                                    console.log("Sorry Word not found in dictionary")
                                                                })
                                                                console.log(args[3]);
                                                            break;
                                                        
                                                    }
    
                                                });
                                                function onErr(err){
                                                    console.log(err);
                                                    return 1;
                                                }*/
                                                /*const rl = readline.createInterface({
                                                    input: process.stdin,
                                                    output: process.stdout
                                                });
                                                
                                                rl.question("Enter the answer ? ", function(answer) {
                                                        console.log(`${answer}`);
                                                        rl.close();
                                                        switch(answer){
                                                            case 'def':
                                                                apiRequest('definitions',args[3])
                                                                    .then(res =>{
                                                                        console.log(`The definitions for the word ${args[3]} are`)
                                                                        console.log(definition(res.data));
                                                                    })
                                                                    .catch(err=> {
                                                                        console.log("Sorry Word not found in dictionary")
                                                                    })
                                                                    console.log(args[3]);
                                                                break;
                                                            
                                                        }
    
                                                });*/
                                                
                                               // console.log("you quit");
                                                break;
                                            case 4:
                                                flag=1;
                                                console.log('quiting');
                                                break;
                                        }
                                    }
                                }
                                console.log("The final score is:"+score);
                              process.exit();  
                              //flag1=1;
                              //break;
                            }
                            //process.exit();        
                        })
                        .catch(err=> {
                            console.log("Sorry Word not found in dictionary")
                        })   
                })
                .catch(err => {
                    console.log("Sorry Word not found in dictionary")
                })
            break;
        
        //execute1();
        //process.exit();
        
      /*  prompt.start();
        prompt.get(['how many times do you want to play the game'],function(err,result){
            if(err){
                return onErr(err);
            }
            for(i=0;i<result.value;i++){
                    execute();
            }
        })
        function onErr(err){
            console.log(err);
            return 1;
        }
        execute();*/
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
    