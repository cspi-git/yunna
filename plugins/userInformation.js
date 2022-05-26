"use strict";

// Main
class Plugin {
    constructor(log, yunna, dependencies, accessToken){
        this.log = log
        this.yunna = yunna
        this.dependencies = dependencies
        this.accessToken = accessToken
    }

    info(){
        return {
            name: "User Information",
            description: "Get the specified user information.",
            code: "ui",
            authors: ["I2rys"],
            args: [
                {
                    name: "id",
                    description: "Facebook user id.",
                    required: true
                }
            ]
        }
    }

    run(args){
        const prettyJSON = this.dependencies.prettyJSON
        const axios = this.dependencies.axios
            
        return new Promise(async(resolve)=>{
            var response = await axios(`https://graph.facebook.com/${args.id}?access_token=${this.accessToken}`)
            response = response.data

            console.log(`\n${prettyJSON(response, {
                indentationLength: 1,
                alignKeyValues: true
            })}`)

            resolve()
        })
    }
}

module.exports = Plugin