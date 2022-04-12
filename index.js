const express = require('express');
const bodyParser = require('body-parser');
require("dotenv").config();
const app = express();
const port = process.env.PORT;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.get('/status/:worldName', (req, res) => {
    const worldName = req.params.worldName;
    const pass = req.headers.authorization;
    if (pass === process.env.SECRET) {
        if(!worldName) res.status(400).send("Missing worldName");
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
app.get('/logasfile/:worldName/:file', (req, res) => {
    const worldName = req.params.worldName;
    const file = req.params.file;
    const pass = req.headers.authorization;
    
    
    if (pass === process.env.PASS) {
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

        }

    }

});
app.post('/start/:worldName', (req, res) => {
    const worldName = req.params.worldName;
    const pass = req.headers.authorization;
    if (pass === process.env.SECRET) {
        if(!worldName) res.status(400).send("Missing worldName");

        require('child_process').exec(`${process.env.MSCS_BIN} status ${worldName}`, (err,stdout,stderr) => {
            if(stdout.includes("starting up") ) {
                res.status(425).send("Server is still starting up");
            }
        });

        require('child_process').exec(`${process.env.MSCS_BIN} start ${worldName}`, (err,stdout,stderr) => {
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
app.post('/stop/:worldName', (req, res) => {
    const worldName = req.params.worldName;
    const pass = req.headers.authorization;
    if (pass === process.env.SECRET) {
        if(!worldName) res.status(400).send("Missing worldName");
        require('child_process').exec(`${process.env.MSCS_BIN} stop ${worldName}`, (err,stdout,stderr) => {
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
app.post('/restart/:worldName', (req, res) => {
    const worldName = req.params.worldName;
    const pass = req.headers.authorization;
    if (pass === process.env.SECRET) {
        if(!worldName) res.status(400).send("Missing worldName");
        require('child_process').exec(`${process.env.MSCS_BIN} restart ${worldName}`, (err,stdout,stderr) => {
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


app.listen(port, () => console.log(`App listening on port ${port}!`));