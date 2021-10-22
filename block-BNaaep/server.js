var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');

let server = http.createServer(handleRequest);
function handleRequest(req, res) {
    var store = '';
    console.log(req.method, req.url);
    var parsedUrl = url.parse(req.url, true);
    req.on('data', (chunk) => {
        store += chunk;
    })
    req.on('end', () => {

        if (req.method === 'GET' && req.url === '/') {
            res.writeHead(202, { 'content-type': 'image/png' })
            fs.createReadStream('./assets/images/index.png').pipe(res);

        } else if (req.method === 'GET' && req.url === '/about') {
            res.writeHead(202, { 'content-type': 'image/png' })
            fs.createReadStream('./assets/images/about.png').pipe(res);
        } else if (req.url.split('.').pop() === 'jpg') {
            res.writeHead(202, { 'content-type': 'image/jpg' })
            fs.createReadStream(`./${req.url}`).pipe(res);

        } else if (req.url.split('.').pop() === 'css') {
            res.writeHead(202, { 'content-type': 'text/css' })
            fs.createReadStream(`./${req.url}`).pipe(res);

        } else if (req.method === 'GET' && req.url === '/contact') {
            res.writeHead(202, { 'content-type': 'text/html' })
            fs.createReadStream('./form.html').pipe(res);
        } else if (req.method === 'POST' && req.url === '/form') {

            console.log(store);
            var parsedData = qs.parse(store);
            console.log(parsedData);
            fs.createReadStream('./form.html').pipe(res);
            fs.open(`./contacts/${parsedData.Username}.json`, 'wx', (err, fd) => {
                if (err) {
                    res.writeHead(404, { 'content-type': 'text/html' })
                    res.end(`<p>Contact is already present</p>`);
                    throw err;

                }
                fs.writeFile(fd, JSON.stringify(parsedData), (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log('written successfully');
                    fs.close(fd, (err) => {
                        if (err) {
                            throw err;
                        }
                        res.writeHead(202, { 'content-type': 'text/html' })
                        res.end(`<p>Contact saved Successfully</p>`);
                    })
                });
            })
        }
        else if (req.method === 'GET' && parsedUrl.pathname === '/users') {

            let username = parsedUrl.query.username;

            if (username) {


                fs.open(`./contacts/${username}.json`, 'r+', (err, fd) => {
                    if (err) {
                        throw err;
                    }
                    fs.readFile(fd, (err, data) => {
                        if (err) {
                            throw err;
                        }

                        let parseData = JSON.parse(data.toString());
                        res.writeHead(202, { 'content-type': 'text/html' })
                        res.end(`
                    <h2>Name: ${parseData.Name}</h2>
                    <h2>Email: ${parseData.Email}</h2>
                    <h2>Username: ${parseData.Username}</h2>
                    <h2>Age: ${parseData.Age}</h2>
                    <h2>About: ${parseData.Bio}</h2>


                    `)
                    })


                })
            } else {

                var allName = ''
                fs.readdir('./contacts', (err, files) => {
                    if (err) {
                        throw err;
                    }
                    let totalLength = files.length;

                    files.forEach(file => {
                        fs.open(`./contacts/${file}`, 'r+', (err, fd) => {
                            if (err) throw err;
                            fs.readFile(fd, (err, data) => {
                                if (err) throw err;

                                let parseData = JSON.parse(data.toString());




                                console.log(allName);
                                totalLength--;
                                allName += parseData.Name + " ,";
                                if (totalLength === 0) {
                                    res.writeHead(202, { 'content-type': 'text/html' })
                                    res.end(allName);
                                }

                                fs.close(fd, (err) => {
                                    if (err) throw err;


                                })

                            })

                        })

                    })


                })

            }
        }



        else {
            res.end('Page not found');
        }

    })

}
server.listen(5000, () => {
    console.log('Server is listening at port 5000');
})