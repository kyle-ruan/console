var escape = require('escape-html');

module.exports = function(app){
    app.post('/api/webcli', function(req, res){
        var result = new CmdResult('Invalid command', false, true);

        try{
            var args = getArgs(req.body.cmdLine);
            var cmd = args[0].toUpperCase();

            result = _commands[cmd].func(args);
        }
        finally{
            res.send(result);
        }
    });
};

class CmdResult{
    constructor(output, isHTML, isError){
        this.output = output || '';
        this.isHTML = isHTML || false;
        this.isError = isError || false;
    }
}

var _commands = {};

class Command {
    constructor(help, func){
        this.help = help;
        this.func = func;
    }
}

_commands.ECHO = new Command('Echos back the first <token> received', function(args){
    if(args.length >=2 ){
        return new CmdResult(args[1]);
    }

    return new CmdResult('');
});

_commands.ADD = new Command("Return the sum of two numbers", function(args){
  var x = Number(args[1]);
  var y = Number(args[2]);
  var sum = (x+y).toString();

  return new CmdResult(sum);
});

_commands.HELP = new Command('Lists available commands', function(args){
  var s ="<table class='webcli-tbl'>";

  Object.keys(_commands).forEach(function(key){
    var cmd = _commands[key];
    var name = escape(key.toLowerCase());
    s += "<tr><td class='webcli-lbl'>" + name + "</td><td>:</td><td class='webcli-val'>"
                                       + escape(cmd.help) + "</td></tr>";
  });
  s += "</table>";

  return new CmdResult(s, true);
});

// Client commands
_commands.CLS = new Command('Clear the console');
_commands.COLOR = new Command('Display color for hex value')
function getArgs(cmdLine){
    var tokenEx = /[^\s"]+|"[^"]*"/g;
    var quoteEx = /"/g;
    var args = cmdLine.match(tokenEx);

    for(var i = 0; i < args.length; i++){
        args[i] = args[i].replace(quoteEx, '');
    }
    return args;
}
