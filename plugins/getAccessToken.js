"use strict";

// Main
class plugin {
    constructor(log, yunna, d){
        this.log = log
        this.yunna = yunna
        this.d = d
    }

    info(){
        return {
            name: "Get Access Token",
            description: "Get the specified account access token.",
            code: "gat",
            authors: ["I2rys"],
            args: [
                {
                    name: "email",
                    description: "Account email.",
                    required: true
                },
                {
                    name: "password",
                    description: "Account password.",
                    required: true
                }
            ]
        }
    }

    getSig(formData){
        let sig = ""

        Object.keys(formData).forEach((key)=>{
            sig += `${key}=${formData[key]}`
        })

        sig = this.yunna.md5(`${sig}62f8ce9f74b12f84c123cc23437a4a32`)

        return sig
    }

    run(args){
        const queryString = this.d.queryString
        const axios = this.d.axios
        const uuid = this.d.uuid
        const _ = this.d._
        const Yunna = this.yunna

        return new Promise(async(resolve)=>{
            const sim = Yunna.randNumberBetween(2e4, 4e4)
            const deviceID = uuid.v4()
            const adID = uuid.v4()

            var formData = {
                adid: adID,
                format: "json",
                device_id: deviceID,
                email: args.email,
                password: args.password,
                cpl: "true",
                family_device_id: deviceID,
                credentials_type: "device_based_login_password",
                generate_session_cookies: "1",
                error_detail_type: "button_with_disabled",
                source: "device_based_login",
                machine_id: Yunna.randString(24),
                meta_inf_fbmeta: "",
                advertiser_id: adID,
                currently_logged_in_userid: "0",
                locale: "en_US",
                client_country_code: "US",
                method: "auth.login",
                fb_api_req_friendly_name: "authenticate",
                fb_api_caller_class: "com.facebook.account.login.protocol.Fb4aAuthHandler",
                api_key: "882a8490361da98702bf97a021ddc14d"
            }

            formData.sig = this.getSig(Yunna.sortObject(formData))

            const response = await axios({
                url: "https://b-api.facebook.com/method/auth.login",
                method: "post",
                data: formData,
                transformRequest: [
                    function(data, headers){
                      return queryString.stringify(data)
                    }
                ],
                headers: {
                    'x-fb-connection-bandwidth': Yunna.randNumberBetween(2e7, 3e7),
                    'x-fb-sim-hni': sim,
                    'x-fb-net-hni': sim,
                    'x-fb-connection-quality': 'EXCELLENT',
                    'x-fb-connection-type': 'cell.CTRadioAccessTechnologyHSDPA',
                    'user-agent': 'Dalvik/1.6.0 (Linux; U; Android 4.4.2; NX55 Build/KOT5506) [FBAN/FB4A;FBAV/106.0.0.26.68;FBBV/45904160;FBDM/{density=3.0,width=1080,height=1920};FBLC/it_IT;FBRV/45904160;FBCR/PosteMobile;FBMF/asus;FBBD/asus;FBPN/com.facebook.katana;FBDV/ASUS_Z00AD;FBSV/5.0;FBOP/1;FBCA/x86:armeabi-v7a;]',
                    'content-type': 'application/x-www-form-urlencoded',
                    'x-fb-http-engine': 'Liger'
                }
            })

            this.log("i", `The account access token is ${response.data.access_token}`)
            resolve()
        })
    }
}

module.exports = plugin