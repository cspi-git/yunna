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
            name: "Save User Posts",
            description: "Scrape & save the specified user posts.",
            code: "sup",
            authors: ["I2rys"],
            args: [
                {
                    name: "id",
                    description: "Facebook user id.",
                    required: true
                },
                {
                    name: "output",
                    description: "Output file of the scraped posts(JSON).",
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
            const posts = []

            async function done(){
                log("i", `${posts.length} posts found. Saving, please wait.`)
                fs.writeFileSync(args.output, JSON.stringify(posts, null, 2), "utf8")
                log("i", "Finished.")
                resolve()
            }

            async function getPosts(next, accessToken){
                try{
                    var response = await axios(next ? next : `https://graph.facebook.com/${args.id}/posts?access_token=${accessToken}`)
                    response = response.data

                    if(!response.data.length){
                        log("e", "No posts found in the specified user.")
                        return resolve()
                    }

                    for( const post of response.data ) if(posts.indexOf(post) === -1) posts.push(post)

                    response.paging.hasOwnProperty("next") ? getPosts(response.paging.next, accessToken) : done()
                }catch{
                    done()
                }
            }
            
            log("i", "Scraping posts, please wait.")
            getPosts(null, this.accessToken)
        })
    }
}

module.exports = plugin