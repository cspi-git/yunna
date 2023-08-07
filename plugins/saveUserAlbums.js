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
            name: "Save User Albums",
            description: "Scrape & save the specified user albums.",
            code: "sua",
            authors: ["I2rys"],
            args: [
                {
                    name: "id",
                    description: "Facebook user id.",
                    required: true
                },
                {
                    name: "output",
                    description: "Output file of the scraped albums(JSON).",
                    required: true
                }
            ]
        }
    }

    run(args){
        const axios = this.d.axios
        const fs = this.d.fs
        const log = this.log

        return new Promise((resolve)=>{
            const albums = []

            async function done(){
                log("i", `${albums.length} albums found. Saving, please wait.`)
                
                fs.writeFileSync(args.output, JSON.stringify(albums, null, 2), "utf8")
                
                log("i", "Finished.")
                resolve()
            }

            async function getAlbums(next, accessToken){
                try{
                    var response = await axios(next ? next : `https://graph.facebook.com/${args.id}/albums?access_token=${accessToken}`)
                    response = response.data

                    if(!response.data.length){
                        log("e", "No albums found in the specified user.")
                        return resolve()
                    }

                    for( const post of response.data ) if(albums.indexOf(post) === -1) albums.push(post)

                    response.paging.hasOwnProperty("next") ? getAlbums(response.paging.next, accessToken) : done()
                }catch{
                    done()
                }
            }
            
            log("i", "Scraping albums, please wait.")
            getAlbums(null, this.accessToken)
        })
    }
}

module.exports = plugin