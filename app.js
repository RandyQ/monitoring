const express = require('express');
const app = express();
const fs = require('fs');
const readline = require('readline');

// Home page.  Used to print the logfile.txt for testing purposes.
app.get('/', function(req, res) {
    fs.readFile("./logs/logfile.txt", function (err, buf) {
        err ? res.send("Failed to read file when calling the /logs route\n") : res.send(buf.toString());
    });
});

// Returns the total sales
app.get('/gettotal', async function(req, res) {    
    let words = await extractAllSubStrings();
    let totalPrice = 0;
    for(let i = 0; i < words.length; i++) {
        if (words[i] === "Price:") {
            totalPrice += parseInt(words[i + 1]);
        }
    }

    res.send(`Total amount of earnings seen thus far: $${totalPrice.toFixed(2)}\n`);
});

// Returns the item that is the top seller
app.get('/gettopseller', async function(req, res) {
    let maxCount = 0;
    let entries = Object.entries(await totalEachItemQuantities());
    let topSeller = "";
    for (const [item, count] of entries) {
        if (count > maxCount) {
            maxCount = count;
            topSeller = item;
        }
    }
    
    res.send(`Top seller: ${topSeller}\n`);
});

// Counts the total number of requests
app.get('/getrequestcount', async function(req, res){
    let words = await extractAllSubStrings();
    let requestCount = 0;
    for (let word of words) {
        if (word.substring(0, 1) === '/') {
            ++requestCount;
        }
    }

    res.send(`Total number of requests: ${requestCount}\n`);
});

// Retrieves the last request status (FAILED or SUCCESSFUL)
app.get('/getlastrequeststatus', async function(req, res) {
    let words = await extractAllSubStrings();
    if (words.lastIndexOf('SUCCESSFULLY') < words.lastIndexOf('FAILED')) {
        res.send("The last result was NOT successful: FAILED\n");
    } else {
        res.send("The last result successfully sent: SUCCESS\n");
    }
});

// Retrieves the last request time
app.get('/getlastrequesttime', async function(req, res) {
    let words = await extractAllSubStrings();
    let lastRequestTime;
    for (let i = 0; i < words.length; i++) {
        if (words[i] === "Time:") {
            lastRequestTime = words[i + 1];
        }
    } 

    res.send(`The last request time was: ${lastRequestTime}\n`);
});

// Places each string in the logfile.txt as an element in an array
function extractAllSubStrings() {
    return new Promise((resolve) => {
        fs.readFile("./logs/logfile.txt", function (err, buf) {
            err ? res.send("Failed to read file!  This may be due to a non-existent logfile..\n") 
            : resolve(buf.toString().split(/\n|\r|\s/));
        });
    });
}

// Counts the number of each item sold
async function totalEachItemQuantities() {
    let words = await extractAllSubStrings();
    let itemCount = { hotdogs: 0, hamburgers: 0, sodas: 0, cookies: 0 };
    for(let i = 0; i < words.length; i++) {
        if (words[i] === "Item:"){
            if (words[i + 1] === "hotdog") {
                itemCount.hotdogs += parseInt(words[i + 3]);
            } else if (words[i + 1] === "hamburger") {
                itemCount.hamburgers += parseInt(words[i + 3]);
            } else if (words[i + 1] === "soda") {
                itemCount.sodas += parseInt(words[i + 3]);
            } else if (words[i + 1] === "cookie") {
                itemCount.cookies += parseInt(words[i + 3]);
            }
        }
    }

    return itemCount;
}

module.exports = app;