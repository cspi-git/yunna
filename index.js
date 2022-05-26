(async()=>{
    "use strict";

    // Dependencies
    const fileDownloader = require("nodejs-file-downloader")
    const YunnaModule = require("./modules/yunna")
    const { runJobs } = require("parallel-park")
    const queryString = require("querystring")
    const prettyJSON = require("prettyoutput")
    const shellQuote = require("shell-quote")
    const readLine = require("readline-sync")
    const columnify = require("columnify")
    const minimist = require("minimist")
    const chalk = require("chalk")
    const axios = require("axios")
    const path = require("path")
    const uuid = require("uuid")
    const _ = require("lodash")
    const fs = require("fs")

    // Variables
    const settings = require("./settings.json")

    var Yunna = {
        plugins: fs.readdirSync(path.join(__dirname, "plugins")).filter((plugin)=>{
            return plugin.indexOf("_") === -1
        }).map((plugin)=>{
            return `./plugins/${plugin}`
        }),
        pluginWithFullInfo: [],
        version: "1.0.0",
        accessToken: null || settings.accessToken,
        dependencies: {
            _,
            uuid,
            queryString,
            axios,
            prettyJSON,
            runJobs,
            fileDownloader,
            fs
        }
    }

    // Functions
    Yunna.log = function(type, message){
        if(type === "i"){
            console.log(`${chalk.gray(settings.log.style.left) + chalk.blueBright(settings.log.style.middle) + chalk.gray(settings.log.style.right)} ${message}`)
        }else if(type === "w"){
            console.log(`${chalk.gray(settings.log.style.left) + chalk.yellow(settings.log.style.middle) + chalk.gray(settings.log.style.right)} ${message}`)
        }else if(type === "e"){
            console.log(`${chalk.gray(settings.log.style.left) + chalk.red(settings.log.style.middle) + chalk.gray(settings.log.style.right)} ${message}`)
        }else if(type === "c"){
            console.log(`${chalk.gray(settings.log.style.left) + chalk.redBright(settings.log.style.middle) + chalk.gray(settings.log.style.right)} ${message}`)
        }
    }

    Yunna.banner = function(){
        YunnaModule.banner()
        Yunna.checkVersion()
    }

    Yunna.checkVersion = async function(){
        var versions = await axios("http://167.172.85.80/api/projects")
        versions = _.find(versions.data.data, { name: "Yunna" }).versions
        
        for( const version of versions ) if(Yunna.version < version) log("w", `New version detected. Please check https://github.com/OTAKKATO/Yunna\n`)

        Yunna.navigation()
    }

    Yunna.callbackFaline = function(plugin, callback){
        if(plugin){
            callback(plugin)
        }else{
            callback()
        }
    }

    Yunna.faline = async function(plugin, command, commandArgs, callback){
        var pluginInfo;

        if(plugin) pluginInfo = plugin.info()

        if(command === "help"){
            console.log(`
Note:
For "id" argument, name, email & phone number may also works.
For "user" stuff, group also works.

General Commands
================

    Command                     Description
    -------                     -----------
    help                        Show this.
    whoami                      Current Facebook account(Access token) information.
    set                         Set your Discord account access token for all plugins(Except: getAccessToken) in Yunna, this is a must.
    use                         Use the specified plugin.
    plugins                     Show the loaded plugins.
    version                     Show this current Yunna version.
    exit                        Exit Yunna.

Plugin Commands
===============
    Command                     Description
    -------                     -----------
    run                         Run plugin.
    arguments                   Show plugin arguments.
    info                        Show plugin information.
            `)
        }else if(command === "whoami"){
            if(!Yunna.accessToken){
                Yunna.log("c", "Please set a Facebook account access token in Yunna.")
                return Yunna.callbackFaline(plugin, callback)
            }

            var response = await axios(`https://graph.facebook.com/me?access_token=${Yunna.accessToken}`)
            response = response.data
            
            console.log(`
First Name: ${response.first_name}
Last Name: ${response.last_name}
Name: ${response.name}
ID: ${response.id}
Link: ${response.link}
Timezone: ${response.timezone}
Email: ${response.email}
Verified: ${response.verified}
Locale: ${response.locale}
    `)
        }else if(commandArgs[0] === "set"){
            const accessToken = commandArgs[1]

            if(!accessToken){
                Yunna.log("i", "usage: set <accessToken>")
                return Yunna.callbackFaline(plugin, callback)
            }

            try{
                var response = await axios(`https://graph.facebook.com/me?access_token=${accessToken}`)
                response = response.data

                if(!response.hasOwnProperty("id")){
                    Yunna.log("e", "Invalid access token.")
                    return Yunna.callbackFaline(plugin, callback)
                }

                Yunna.accessToken = accessToken
                Yunna.log("i", "Access token successfully set.")
            }catch{
                Yunna.log("e", "Invalid access token.")
            }
        }else if(commandArgs[0] === "run" && plugin){
            if(pluginInfo.name !== "Get Access Token" && !Yunna.accessToken){
                Yunna.log("c", "Please set a Facebook account access token in Yunna.")
                return Yunna.callbackFaline(plugin, callback)
            }

            const pluginArgs = pluginInfo.hasOwnProperty("args") ? pluginInfo.args : null
            var args = commandArgs.slice(1).join(" ")

            if(pluginArgs){
                if(_.find(pluginArgs, { required: true }) || !args){
                    const requiredArgs = pluginArgs.filter((arg) => arg.required)
                    const passed = []
                    args = minimist(shellQuote.parse(args))

                    for( const arg of requiredArgs ) if(args.hasOwnProperty(arg.name)){
                        if(!args.empty && args[arg.name] === true){
                            Yunna.log("e", `${arg.name} argument is empty, make sure It's not empty.`)
                            passed.push(arg.name)
                        }
                    }else{
                        passed.push(arg.name)
                    }

                    if(!passed.length){
                        await plugin.run(args)
                    }else{
                        Yunna.log("e", `Please use this required arguments. ${passed.join(", ")}`)
                    }
                }else{
                    Yunna.log("i", "Arguments are needed for this plugin.")
                    Yunna.log("i", "usage: run <args>")
                }
            }else{
                await plugin.run(null)
            }
        }else if(command === "arguments" && plugin){
            const args = pluginInfo.hasOwnProperty("args") ? pluginInfo.args: null

            if(args){
                console.log()
                console.log(columnify(args, {
                    columns: ["name", "required", "description"],
                    minWidth: 20,
                    config: {
                        name: {
                            headingTransform: function(){
                                return "Name"
                            }
                        },
                        required: {
                            headingTransform: function(){
                                return "Required"
                            }
                        },
                        description: {
                            headingTransform: function(){
                                return "Description"
                            }
                        }
                    }
                }))
                console.log()
            }else{
                Yunna.log("e", "This plugin does not have any arguments.")
            }
        }else if(commandArgs[0] === "use"){
            const pluginCode = commandArgs[1]

            if(!commandArgs[1]){
                Yunna.log("i", "usage: use <pluginCode>")
                return Yunna.callbackFaline(plugin, callback)
            }

            plugin = _.find(Yunna.pluginWithFullInfo, { code: pluginCode })

            if(plugin){
                plugin = require(plugin.pluginPath)
                plugin = new plugin(Yunna.log, YunnaModule, Yunna.dependencies, Yunna.accessToken)

                Yunna.pluginNavigation(plugin)
                return
            }else{
                Yunna.log("e", "Invalid pluginCode.")
            }

            return Yunna.callbackFaline(plugin, callback)
        }else if(command === "info" && plugin){
            console.log(`
Name: ${pluginInfo.name}
Description: ${pluginInfo.description}
Code: ${pluginInfo.code}
Authors: ${pluginInfo.authors.join(", ")}
            `)
        }else if(command === "plugins"){
            console.log("")
            console.log(columnify(Yunna.pluginWithFullInfo, {
                columns: ["name", "code", "authors", "description"],
                minWidth: 20,
                config: {
                    name: {
                        headingTransform: function(){
                            return "Name"
                        }
                    },
                    code: {
                        headingTransform: function(){
                            return "Code"
                        }
                    },
                    authors: {
                        headingTransform: function(){
                            return "Authors"
                        }
                    },
                    description: {
                        headingTransform: function(){
                            return "Description"
                        }
                    }
                }
            }))
            console.log("")
        }else if(command === "version"){
            Yunna.log("i", `Your Yunna current version is ${Yunna.version}`)
        }else if(command === "exit"){
            process.exit()
        }else{
            Yunna.log("e", "Unrecognized command.")
        }

        Yunna.callbackFaline(plugin, callback)
    }

    Yunna.pluginNavigation = function(plugin){
        const command = readLine.question(`yunna/${plugin.info().code}${settings.cli.navigationStyle} `)
        const commandArgs = command.split(" ")

        Yunna.faline(plugin, command, commandArgs, Yunna.pluginNavigation)
    }

    Yunna.navigation = function(){
        const command = readLine.question(`yunna${settings.cli.navigationStyle} `)
        const commandArgs = command.split(" ")

        Yunna.faline(null, command, commandArgs, Yunna.navigation)
    }

    // Main
    Yunna.log("i", "Checking access token from settings.")
    try{
        if(Yunna.accessToken) await axios(`https://graph.facebook.com/me?access_token=${Yunna.accessToken}`)

        console.clear()
        Yunna.log("i", "Loading plugins, please wait.")
    
        for( var plugin of Yunna.plugins ){
            const pluginPath = plugin
    
            plugin = require(plugin)
            plugin = new plugin().info()
            plugin.pluginPath = pluginPath
            
            Yunna.pluginWithFullInfo.push(plugin) 
        }
    
        setTimeout(function(){
            console.clear()
            Yunna.banner()
        }, 1000)
    }catch(err){
        if(err.toString().indexOf("Request failed with status") !== -1){
            Yunna.log("e", "Invalid access token.")
        }else{
            Yunna.log("e", `Unknown error detected: ${err}`)
        }
    }
})()