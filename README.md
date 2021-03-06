![BurJS](https://raw.githubusercontent.com/lexmihaylov/burjs/master/burjs.png)

BurJS-NPM
=======
An npm package for the [BurJS](https://github.com/lexmihaylov/burjs) library. This package incudes: 
 * initializin BurJS project folder;
 * generators for Views, Models, Components and Services;
 * static http server;
 * build function by using requirejs;
 * dependency installation.

The project template includes the following packages:
 * burjs
 * jQuery
 * bootstrap
 * requirejs
 * requirejs-text (used for template loading)
 
The template that BurJS-NPM provides is a starter application structure that provides 
an AMD module standard and easy to use build process.

##Installation

    npm install -g lexmihaylov/burjs-npm

##Usage

__Creating project__

    mkdir my_project
    cd my_project
    burjs init
`src/` folder structure:

    +-css/
    +-js/
    | +--app/
    | |  +--services/
    | |  +--models/
    | |  +--components/
    | |  |  +--BaseComponent.js
    | |  +--templates/
    | +--config/
    | |  +--application.js
    | +--vendor/
    | +--main.js
    +-resources/
    +-scss/
    +-index.html
    
__Generators__

    cd my_project
    burjs <model|component|view|service> <ClassName>
    
__Starting a static http server__

    cd my_project/src
    burjs server 8080
    
__Building your project__

    cd my_project
    burjs build
    
This will create a build of your project in my_project/build. For more info: http://requirejs.org/docs/optimization.html.

__Installing components via bower__

    bower install vue
After the bower package has been istalled you need to run:

    burjs install # this will install all the main files listed in bower.json to src/js/vendor
    