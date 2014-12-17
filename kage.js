#!/usr/bin/env node
var args = process.argv.splice(2);
var printUsage = function() {
    console.log("Usage:");
    console.log("\tkagejs [init|server|build|model|component|view] [<name>|<port>]\n");
    console.log("\tkagejs init - create a project in the current directory");
    console.log("\tkagejs server <port> - start listening for http requests " +
           "using current directory as document root");
   console.log("\tkagejs build [<build.js>] - builds the project by using r.js." +
           " For more info: http://requirejs.org/docs/optimization.html");
   console.log("\tkagejs model (<folder>/<ModelName>|<ModelName>) - "+
           "generates a model in public_html/js/app/models.");
   console.log("\tkagejs component (<folder>/<ComponentName>|<ComponentName>) - "+
           "generates a component in public_html/js/app/components.");
   console.log("\tkagejs view (<folder>/<ViewName>|<ViewName>) - "+
           "generates a view in public_html/js/app/templates.");
};

var commands = [
    'init',
    'server',
    'build',
    'model',
    'component',
    'view'
];

var allowedTypes = {
    'model': {
        suffix: 'Model',
        path: process.cwd() + '/public_html/js/app/models/',
        ext: '.js'
    }, 
    'component': {
        suffix: 'Component',
        path: process.cwd() + '/public_html/js/app/components/',
        ext: '.js'
    },
    
    'view': {
        suffix: null,
        path: process.cwd() + '/public_html/js/app/templates/',
        ext: '.ejs'
    }
};

if(args.length < 1) {
    printUsage();
    process.exit();
}

if(commands.indexOf(args[0]) === -1) {
    printUsage();
    process.exit();
}

if((args[0] !== 'init' && args[0] !== 'build') && args.length < 2) {
    printUsage();
    process.exit();
}

var generate = function(type, filename) {
    if(!allowedTypes[type]) {
        console.error("Undefined type: " + type);
    }
    
    var fs = require('fs');
    var typeSuffix = allowedTypes[type].suffix;
    var filePath = allowedTypes[type].path;
    var extension = allowedTypes[type].ext;
    
    
    var template = fs.readFileSync(__dirname + '/templates/' + type + '.tpl',{
        encoding: 'utf8'
    });
    
    var fileName = filename;
    if(fileName.indexOf('/') !== -1) {
        var path = filename.split('/');
        fileName = path[path.length - 1];
        for(var i = 0; i < path.length - 1; i++) {
            filePath += path[i] + '/';
            if(!fs.existsSync(filePath)) {
                fs.mkdir(filePath);
            }
        }
    }

    if(typeSuffix !== null && !(new RegExp(typeSuffix+'$')).test(fileName)) {
        fileName += typeSuffix;
    }
    
    template = template.replace(/\$\(name\)/g, fileName);
    var generatedFile = filePath + fileName + extension;
    
    if(fs.existsSync(generatedFile)) {
        console.error('File exists: ' + generatedFile);
        proccess.exit();
    }
    
    fs.writeFileSync(generatedFile, template);
    
    console.log(generatedFile + ' - Created');
};

var printProjectStructure = function() {
    console.log('+-build/');
    console.log('+-tests/');
    console.log('+-public_html/');
    console.log("| +--css/");
    console.log("| +--js/");
    console.log("| |  +--app/");
    console.log("| |  |  +--services/");
    console.log("| |  |  +--models/");
    console.log("| |  |  +--components/");
    console.log("| |  |  |  +--BaseComponent.js");
    console.log("| |  |  +--templates/");
    console.log("| |  +--config/");
    console.log("| |  |  +--application.js");
    console.log("| |  +--vendor/");
    console.log("| |  +--main.js");
    console.log("| +--resources/");
    console.log("| +--scss/");
    console.log("| +--index.html");
    console.log("+--build.js");
};

switch (args[0]) {
    case 'init':
        
        var wrench = require('wrench');
        var fs = require('fs');
        var sys = require('sys')
        var exec = require('child_process').exec;
        
        if(fs.existsSync('./.kage_project')) {
            console.error('Already a kage.js project.');
            process.exit();
        }
        
        fs.createReadStream(__dirname + '/templates/project/bower.json').
            pipe(fs.createWriteStream( process.cwd()+'/bower.json'));
        
        fs.createReadStream(__dirname + '/templates/project/index.html').
            pipe(fs.createWriteStream( process.cwd()+'/index.html'));
        
        wrench.copyDirSyncRecursive(__dirname + '/templates/project/css', process.cwd()+'/css', 
        {
            forceDelete: true
        });
        
        wrench.copyDirSyncRecursive(__dirname + '/templates/project/js', process.cwd()+'/js', 
        {
            forceDelete: true
        });
        
        wrench.copyDirSyncRecursive(__dirname + '/templates/project/resources', process.cwd()+'/resources', 
        {
            forceDelete: true
        });
        
        wrench.copyDirSyncRecursive(__dirname + '/templates/project/scss', process.cwd()+'/scss', 
        {
            forceDelete: true
        });
        
        fs.mkdir(process.cwd() + '/build');
        fs.mkdir(process.cwd() + '/tests');
        
        var buildTemplate = fs.readFileSync(__dirname + '/templates/build.tpl',{
            encoding: 'utf8'
        });
        fs.writeFileSync('./build.js', buildTemplate);
        fs.writeFileSync('./.kage_project', '');
        
        printProjectStructure();
        
        exec("bower-installer", function(error, stdout, stderr) {
            sys.puts(stdout);
        });
        
        console.log('kage.js Project Generated.');
        break;
    case 'build':
        var fs = require('fs');
        var buildConfigFile = process.cwd() + '/build.js';
        
        if(args[1]) {
            buildConfigFile = args[1];
        }
        
        if(!fs.existsSync(buildConfigFile)) {
            console.error("Build config file does not exist.");
            process.exit();
        }
        
        var config = fs.readFileSync(buildConfigFile, {
            encoding: 'utf8'
        });
        
        config = eval(config);
        var rjs = require('requirejs');
        rjs.optimize(config);
        break;
    case 'server':
        var connect = require('connect');
        var http = require('http');
        var server = connect().
                use(connect.static(process.cwd())).
                use(connect.logger());
        
        http.createServer(server).
                listen(args[1]);
        
        console.log('Listening on port ' + args[1]);
        console.log('Document root is ' + process.cwd());
        console.log('Press Ctrl-C to quit');
        break;
    default:
        generate(args[0], args[1]);
        break;
}

