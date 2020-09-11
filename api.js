const http = require('http');
const args = process.argv;
const userArgs = args.slice(2);
const userArgslength = userArgs.length;
const baseApi = 'http://fourtytwowords.herokuapp.com/';
const wordApi = baseApi + 'word.json/';
const wordsApi = baseApi + 'words.json/';
const api_key = 'a98eff3917981ec80a86523e17be5f61287bd0a6595728ef9feb6a9cf50f354db16fe8aa5e96d7405784d4771876d1ff84d8b644c569371bd70ce16fa49d2fff5e15de4c572b47f55792f763df03a2c7';

function apiRequestPromises(url) {
    const promiseToken = new Promise((resolve, reject) => {
        http.get(url, (res) => {
            var rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
                resolve(rawData);
            });

        });
    });
    return promiseToken;
}
function printDefinitions(word) {
    const promiseToken = definitions(word);
    promiseToken.then((promisedData) => {
            if (promisedData.length >= 1) {
                console.log('\nThe definitions for the word:' + word);
                promisedData = JSON.parse(promisedData);
                for (var index in promisedData) {
                    console.log((parseInt(index) + 1) + '\t' + (promisedData[index].text));
                }
            } else {
                console.log('There are no definitions found for the word you entered :' + word);
            }
        })
        .catch();
}
var definitions = (word) => {
    var url = '';
    api = word + '/definitions?api_key=' + api_key;
    url = wordApi + api;
    return apiRequestPromises(url);
};
var synonyms = (word) => {
    var url = '';
    api = word + '/relatedWords?api_key=' + api_key;
    url = wordApi + api;
    return apiRequestPromises(url);
};

var printSynonyms = (word) => {
    synonyms(word).then((data) => {
        data = JSON.parse(data)
        if (data.length == 1) {
            var words = data[0].words;
            console.log('\nThe synonyms for the word' + word);
            for (var index in words) {
                console.log((parseInt(index) + 1) + '\t' + words[index]);
            }
        } else {
            console.log('\nThere are no SYNONYMS found for the word:' + word);
        }
    });
};
var antonyms = (word) => {
    var url = '';
    api = word + '/relatedWords?api_key=' + api_key;
    url = wordApi + api;
    return apiRequestPromises(url);
}

var printAntonyms = (word) => {
    antonyms(word).then((data) => {
        data = JSON.parse(data)
        if (data.length == 2) {
            var words1 = data[0].words;
            console.log('\nThe ANTONYMS for the word:' + word);
            for (var index in words1) {
                console.log((parseInt(index) + 1) + '\t' + words1[index]);
            }
        } else {
            console.log('\nThere are no ANTONYMS found for the word :' + word);
        }
    });
};

function examples(word) {
    const promiseToken = apiRequestPromises(wordApi + word + '/examples?api_key=' + api_key);
    promiseToken.then((promisedData) => {
        if (promisedData.length >= 1) {
            console.log('\nThe EXAMPLES for the word:' + word);
            promisedData = JSON.parse(promisedData);
            promisedData = promisedData.examples;
            for (var index in promisedData) {
                console.log((parseInt(index) + 1) + '\t' + promisedData[index].text);
            }
        } else {
            console.log('\nThere are no EXAMPLES found for the word :' + word);
        }
    }).catch(error => {
        console.log(error);

    });
}

var dictionary = (word) => {
    printDefinitions(word);
    printSynonyms(word);
    printAntonyms(word);
    examples(word);
    let promise = new Promise((resolve, reject) => {
        resolve(123);
    });
    return promise;
};
function randomWord() {
    var url = '';
    api = 'randomWord?api_key=' + api_key;
    url = wordsApi + api;
    return apiRequestPromises(url);
}
function permutations(str) {
    if (str.length === 1)
        return str;
    var permut = [];
    for (var i = 0; i < str.length; i++) {
        var s = str[0];
        var _new = permutations(str.slice(1, str.length));
        for (var j = 0; j < _new.length; j++)
            permut.push(s + _new[j]);
        str = str.substr(1, str.length - 1) + s;
    }
    return permut;
}
module.exports = {
    definitions,
    synonyms,
    permutations,
    randomWord,
    dictionary,
    printDefinitions,
    printSynonyms,
    printAntonyms,
    examples
};
