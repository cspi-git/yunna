"use strict";

// Dependencies
const randomString = require("randomstring")
const crypto = require("crypto")
const chalk = require("chalk")

// Variables
var Yunna = {}

// Functions
Yunna.heartBanner = function(){
    console.log(chalk.redBright(`
                ,ae,
            ,88888e
    ,a888b.9888888i
    888888888888888
    88888888888888Y
    '8888888888888'
      "S888888888"      ALWAYS
        "7888888Y
            "e88j
              "Y
    `))
}

// Main
Yunna.banner = function(){
    const banners = [Yunna.heartBanner]

    banners[Math.floor(Math.random() * banners.length)]()
}

Yunna.sortObject = function(object){
    const keys = Object.keys(object).sort()
    var sortedObject = {}

    for( const obj in keys ){
      sortedObject[keys[obj]] = object[keys[obj]]
    }

    return sortedObject
}

Yunna.md5 = function(string){
    return crypto.createHash("md5").update(string).digest("hex")
}

Yunna.randNumberBetween = function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min)
}

Yunna.randString = function(limit){
    return randomString.generate({
      charset: "abcdefghijklmnopqrstuvwxyz",
      length: limit
    })
}

module.exports = Yunna