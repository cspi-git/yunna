"use strict";

// Main
class plugin {
    constructor(log, yunna, d, accessToken){
        this.log = log
        this.yunna = yunna
        this.d = d
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
        const prettyJSON = this.d.prettyJSON
        const axios = this.d.axios
            
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

module.exports = plugin