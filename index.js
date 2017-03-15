var restify = require('restify');
var querystring = require('querystring');

function respond(req, res, next) {
    res.send("OK");
    next();
}

var server = restify.createServer();

server.use(restify.acceptParser(server.acceptable));
//server.use(restify.authorizationParser());
server.use(restify.dateParser());
server.use(restify.queryParser());
//server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());
//server.use(restify.requestExpiry());
//server.use(restify.throttle({


server.get('/healthcheck', respond);

server.listen(process.env.PORT || 8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});



server.post('/slack/recieve', (req, res, next) => {
    var request = querystring.parse(req.body);

    console.log(request);

    req.headers.accept = 'application/json';  // screw you client!

    const ticket = `<@${request.user_id}|${request.user_name}>: ${request.text}`
    res.send(
        {
            "attachments": [
                {
                    "title": ticket,
                    "text": "Who's got this? :raised_hand: ",
                    "fallback": "Sorry, you can't grab this one",
                    "callback_id": ticket,
                    "color": "#ff0000",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "status",
                            "text": "I got it",
                            "type": "button",
                            "value": "started"
                        }]
                }
            ]
        }

    );
    next();
}
)


server.post('/slack/message', (req, res, next) => {

    var request = querystring.parse(req.body);
    request = JSON.parse(request.payload);

    console.log(request)
    req.headers.accept = 'application/json';  // screw you client!



    if (request.actions[0].name === 'status' && request.actions[0].value === 'started')
        sendStartedResponse(request, req, res, next)

    if (request.actions[0].name === 'status' && request.actions[0].value === 'done')
        sendDoneResponse(request, req, res, next)

    throw Error("I just don't know what to do")
})

function sendStartedResponse(request, req, res, next) {

    const ticket = request.callback_id;

    var text = `<@${request.user.id}|${request.user.name}> has started the :clock1:`

    res.send(
        {
            "attachments": [
                {
                    "title": ticket,
                    "text": text,
                    "fallback": text,
                    "callback_id": ticket,
                    "color": "#ffa500",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "status",
                            "text": "It's done",
                            "type": "button",
                            "value": "done"
                        }]
                }
            ]
        }

    );
    next();


}

function sendDoneResponse(request, req, res, next) {

    const ticket = request.callback_id;

    res.send(
        {
            "attachments": [
                {
                    "fallback": ticket,
                    "title": ticket,
                    "color": "#008000",
                    "text": "It's  done :checkered_flag:",
                    "color": "#008000",
                    "attachment_type": "default",
                }
            ]
        }

    );
    next();
}

