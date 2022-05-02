import * as http from 'node:http';

const HttpStatus = Object.freeze({
    // 20x
    OK: 200,

    // 40x
    NOT_FOUND: 404,
});

const HttpHeader = Object.freeze({
    CONTENT_TYPE: 'content-type',
});

const Mime = Object.freeze({
    TEXT_WITH_UTF8: 'text/plain; charset=utf-8',
});

const PORT = 8030;

(async function main(_process) {
    const server = http.createServer((req, res) => {
        const url = req.url;
        console.log(`request incoming: ${url}`);

        if (url === '/hello_this_is_mock') {
            res.setHeader(HttpHeader.CONTENT_TYPE, Mime.TEXT_WITH_UTF8);
            res.writeHead(HttpStatus.OK);
            res.end(`this is mock server listening on ${String(PORT)}`);
            return;
        }

        res.writeHead(HttpStatus.NOT_FOUND);
        res.end();
    });
    server.listen(PORT);
    console.log(`mock server listen on ${String(PORT)}`);
})(process);
