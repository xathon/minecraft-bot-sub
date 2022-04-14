const express = require('express');
const fs = require('fs');
require("dotenv").config();
const app = express();
const port = process.env.PORT;

function validate (req) {
    return JSON.parse(process.env.WORLDS).includes(req.params.worldName) && process.env.SECRET === req.headers.authorization;
}

app.post('/', (req, res) => {
    const command = req.body;
    const pass = req.headers.authorization;
    if (pass === process.env.SECRET) {
        res.status(200).send("OK");
    } else {
        console.log(req.headers);	
        res.status(401).send("Unauthorized");
    }
});

app.get('/status/', (req, res) => { res.status(400).send("Missing worldName") });

app.get('/status/:worldName', (req, res) => {
    const worldName = req.params.worldName;
    if(!worldName) res.status(400).send("Missing worldName");
    if(validate(req)) {
        require('child_process').exec(`${process.env.MSCS_BIN} status ${worldName}`, (err,stdout,stderr) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            } else {
                res.status(200).send(stdout);
            }
        });
    } else {
        res.status(401).send("Unauthorized");
    }
});

app.get('/logasfile/', (req, res) => { res.status(400).send("Missing worldName") });
app.get('/logasfile/:worldName', (req, res) => { res.status(400).send("Missing file") });

app.get('/logasfile/:worldName/:file', (req, res) => {
    const worldName = req.params.worldName;
    const file = req.params.file;
    if(!worldName) res.status(400).send("Missing worldName");
    if(!file) res.status(400).send("Missing file");   
    
    if (validate(req)) {
        if(file === "console.out") {
            require('fs').copyFile(`${process.env.MSCS_WORLDS}/${worldName}/console.out`, '/tmp/console.out.log', (err) => { 
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                } else {
                    res.status(200).download('/tmp/console.out.log');
                }
            });
        }
        if(file === "logs/latest.log") {

            res.status(200).download(`${process.env.MSCS_WORLDS}/${worldName}/${file}`);

        } else {
            res.status(400).send("Invalid file");
        }

    }

});
app.post('/start/', (req, res) => { res.status(400).send("Missing worldName") });
app.post('/start/:worldName', (req, res) => {
    const worldName = req.params.worldName;
    if(!worldName) res.status(400).send("Missing worldName");
    if (validate(req)) {
        

        require('child_process').exec(`${process.env.MSCS_BIN} status ${worldName}`, (err,stdout,stderr) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            if(stdout.includes("starting up") ) {
                res.status(425).send("Server is still starting up");
            } else if(stdout.includes("running version") ) {
                res.status(200).send("Server is already running");
            } else {
                require('child_process').exec(`${process.env.MSCS_BIN} start ${worldName}`, (err,stdout,stderr) => {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                } else {
                    res.status(202).send(stdout);
                }
            });
            }
            
            
        });

        
    } else {
        res.status(401).send("Unauthorized");
    }
});
app.post('/stop/', (req, res) => { res.status(400).send("Missing worldName") });
app.post('/stop/:worldName', (req, res) => {
    const worldName = req.params.worldName;
    if(!worldName) res.status(400).send("Missing worldName");

    if (validate(req)) {
        
        require('child_process').exec(`${process.env.MSCS_BIN} status ${worldName}`, (err,stdout,stderr) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            console.log(stdout);
            if(stdout.includes("starting up") ) {
                res.status(425).send("Server is still starting up");
            }
            if(stdout.includes("not running") ) {
                res.status(200).send("Server is already stopped");
            }
            require('child_process').exec(`${process.env.MSCS_BIN} stop ${worldName}`, (err,stdout,stderr) => {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                } else {
                    res.status(200).send(stdout);
                }
            });
        });
    } else {
        res.status(401).send("Unauthorized");
    }
});
app.post('/restart/', (req, res) => { res.status(400).send("Missing worldName") });
app.post('/restart/:worldName', (req, res) => { // TODO this
    const worldName = req.params.worldName;
    if(!worldName) res.status(400).send("Missing worldName");
    if (validate(req)) {
        require('child_process').exec(`${process.env.MSCS_BIN} status ${worldName}`, (err,stdout,stderr) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            console.log(stdout);
            if(stdout.includes("starting up") ) {
                res.status(425).send("Server is still starting up");
            }
            require('child_process').exec(`${process.env.MSCS_BIN} restart ${worldName}`, (err,stdout,stderr) => {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                } else {
                    res.status(200).send(stdout);
                }
            });
        });
    } else {
        res.status(401).send("Unauthorized");
    }
});


app.get('/',function (req, res) {
    res.redirect('https://www.youtube.com/watch?v=o-YBDTqX_ZU'); // because why not
});

app.use(function(req, res){
    res.sendStatus(404);
});

app.listen(port, () => console.log(`App listening on port ${port}!`));