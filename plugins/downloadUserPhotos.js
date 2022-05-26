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
            name: "Download User Photos",
            description: "Download the specified user photos.",
            code: "dup",
            authors: ["I2rys"],
            args: [
                {
                    name: "id",
                    description: "Facebook user id.",
                    required: true
                },
                {
                    name: "output",
                    description: "Output directory of the downloaded photos.",
                    required: true
                }
            ]
        }
    }

    run(args){
        const fileDownloader = this.dependencies.fileDownloader
        const runJobs = this.dependencies.runJobs
        const axios = this.dependencies.axios
        const log = this.log
            
        return new Promise((resolve)=>{
            const photos = []

            async function done(){
                log("i", `${photos.length} photos found. Downloading, please wait.`)
                
                await runJobs(
                    photos,
                    async(photo, index, max)=>{
                        const downloader = new fileDownloader({
                            url: photo,
                            directory: args.output
                        })

                        try{
                            await downloader.download()

                            log("i", `Successfully downloaded: ${photo}`)
                        }catch{
                            log("w", `Unable to download: ${photo}`)
                        }
                    }
                )

                log("i", "Finished downloading.")
                resolve()
            }

            async function getPhotos(next, accessToken){
                try{
                    var response = await axios(next ? next : `https://graph.facebook.com/${args.id}/photos/uploaded?access_token=${accessToken}`)
                    response = response.data

                    for( var photo of response.data ){
                        photo = photo.picture

                        if(photos.indexOf(photo) === -1) photos.push(photo)
                    }

                    if(response.paging.hasOwnProperty("next")){
                        getPhotos(response.paging.next, accessToken)
                    }else{
                        done()
                    }
                }catch{
                    done()
                }
            }
            
            log("i", "Scraping photos, please wait.")
            getPhotos(null, this.accessToken)
        })
    }
}

module.exports = Plugin