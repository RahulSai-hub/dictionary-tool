var ApiFunctions = require("./api.js");
var score = 0;
const readline = require('readline');
var printGameRetryText = () => {
    console.log('Your score is :' + score);
    console.log('You have entered incorrect word.');
    console.log('Choose the options given below and type that option serial number :');
    console.log('1. Try Again');
    console.log('2. Hint');
    console.log('3. Skip');
};
async function playgame() {
    var game_word;
    var game_word_synonyms;
    var gameWordValues = [];
    var hasSynonyms = false;

    var data = await ApiFunctions.randomWord();
    data = JSON.parse(data);
    game_word = data.id;

    Promise.all([ApiFunctions.synonyms(game_word), ApiFunctions.definitions(game_word)]).then(results => {
            synonymData = results[0];
            definitionData = results[1];
            synonymData = JSON.parse(synonymData);
            if (synonymData.length >= 1) {
                hasSynonyms = true;
                game_word_synonyms = synonymData[0].words;
                for (var index in synonymData[0].words) {
                    var temp = synonymData[0].relationshipType;
                    gameWordValues.push({
                        type: [temp],
                        value: synonymData[0].words[index]
                    });
                }
                if (synonymData.length == 2) {
                    for (var index in synonymData[1].words) {
                        var temp = synonymData[1].relationshipType;
                        gameWordValues.push({
                            type: [temp],
                            value: synonymData[1].words[index]
                        });
                    }

                }

            }
            definitionData = JSON.parse(definitionData);
            if (definitionData.length >= 1) {
                for (var index in definitionData) {
                    gameWordValues.push({
                        type: 'definition',
                        value: definitionData[index].text
                    })
                }
            } else {
                console.log('Error occured in the process.\nProcess will exit now.');
                process.exit();
            }
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            //console.log('Press "Ctrl + C" to exit the program.');
            var randomNumber = Math.floor((Math.random() * gameWordValues.length));
            console.log('Can you guess the word for the following question ?  ' + gameWordValues[randomNumber].type);
            console.log(gameWordValues[randomNumber].type + " : " + gameWordValues[randomNumber].value);
            if (gameWordValues[randomNumber].type == 'synonym') {
                for (var index in game_word_synonyms) {
                    if (gameWordValues[randomNumber].value == game_word_synonyms[index]) {
                        game_word_synonyms.splice(index, 1);
                    }
                }
            }
            gameWordValues.splice(randomNumber, 1);
            console.log('Your score is:' + score);
            console.log('Type the word and press the ENTER key.');
            rl.on('line', (input) => {
                var correctAnswer = false;
                if (`${input}` === game_word) {
                    console.log('Thats correct!!');
                    correctAnswer = true;
                    score = score + 10;
                    console.log('Your score is:'+score);
                    rl.close();
                    playgame();
                } else {

                    if (hasSynonyms) {
                        for (var index in game_word_synonyms) {
                            if (`${input}` === game_word_synonyms[index]) {
                                console.log('Thats correct:' + game_word + '"');
                                rl.close();
                                correctAnswer = true;
                                score = score + 10;
                            console.log('Your score is:' + score);
                                playgame();
                            }
                        }
                    }
                    if (`${input}` == '3') {
                        rl.close();
                    }
                    if (!(`${input}` == '1' || `${input}` == '2' || `${input}` == '3') && !correctAnswer) {
                        printGameRetryText();
                    }
                    switch (parseInt(`${input}`)) {
                        case 1:
                        console.log(' Try again to guess the word :');
                            if (score - 2 >= 0) {
                                score = score - 2;
                            } else {
                                score = 0;
                            }
                            console.log('Your score is :' + score);
                            break;
                        case 2:
                            if (score - 3 >= 0) {
                                score = score - 3;
                            } else {
                                score = 0;
                            }
                            console.log('Hint:');
                            var randomNumber = Math.floor((Math.random() * gameWordValues.length));
                            console.log(gameWordValues[randomNumber].type + " : " + gameWordValues[randomNumber].value);
                            if (gameWordValues[randomNumber].type == 'synonym') {
                                for (var index in game_word_synonyms) {
                                    if (gameWordValues[randomNumber].value == game_word_synonyms[index]) {
                                        game_word_synonyms.splice(index, 1);
                                    }
                                }
                            }
                            gameWordValues.splice(randomNumber, 1);
                            if (gameWordValues.length == 0) {
                                var jumble = ApiFunctions.permutations(game_word);
                                for (var index in jumble) {
                                    gameWordValues.push({
                                        type: "jumbled",
                                        value: jumble[index]
                                    });
                                }
                            }
                            console.log('\nTry to guess the word again using the hint provided.');
                            console.log('Your score is :' + score);
                            console.log('Enter the answer:');
                            break;
                        case 3:
                            console.log('The correct word is :' + game_word);
                            console.log('Game Ended.');
                            if (score - 4 >= 0) {
                                score = score - 4;
                            } else {
                                score = 0;
                            }
                            console.log('Your score is:' + score);
                            ApiFunctions.dictionary(game_word).then((results) => {
                                playgame();
                            });
                            break;
                        default:
                    }
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
};



module.exports = {
    playgame
};
