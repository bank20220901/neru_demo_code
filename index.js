import { Voice, neru } from 'neru-alpha';  
import express from 'express';  
  
const app = express();  
const port = process.env.NERU_APP_PORT;  
  
const init = async () => {  
    const session = neru.createSession();  
    const voice = new Voice(session);  
    await voice.onVapiAnswer('onCall').execute();  
};  
  
init();  
  
app.use(express.json());  
  
app.get('/_/health', async (req, res) => {  
    res.sendStatus(200);  
});  
  
async function getNumberFromCRM() {  
    /// some CRM code to resolve number  
    return Promise.resolve('$SECONDARY_NUMBER');  
}  
  
app.post('/onCall', async (req, res, next) => {  
    // const secondaryNumber = await getNumberFromCRM();  
    const secondaryNumber = "8618964980000";  
  
    const session = neru.createSession();  
    const voice = new Voice(session);  
    voice.onVapiEvent({ vapiUUID: req.body.uuid, callback: 'onEvent'}).execute();  
  
    const ncco = [  
        {  
            action: 'talk',  
            language: 'cmn-CN',  
            text: "您好，请输入您想拨打的电话号码，井号键结束",  
            "bargeIn": true  
        },  
        {  
            "action": "input",  
            "type": [ "dtmf" ],  
            "dtmf": {  
                "maxDigits": 15,  
                "submitOnHash": true,  
                "timeOut": 20  
            },  
            "eventMethod": "POST"     
        },  
    ];  
    res.json(ncco);  
});  
  
app.post('/onEvent', async (req, res) => {  
    console.log(neru.getAppUrl());  
    if ('dtmf' in req.body) {  
        const digits = req.body.dtmf.digits;  
        var dst_phone = digits;  
        if (digits.length < 10) { dst_phone = JSON.parse(process.env.NERU_CONFIGURATIONS).contact.number };  
        const ncco = [  
            {  
                action: 'talk',  
                language: 'cmn-CN',  
                text: '请稍等，正在为您接通电话' + dst_phone,  
            },  
            {  
                action: 'connect',  
                from: req.body.to,  
                endpoint: [  
                    {  
                        type: 'phone',  
                        number: dst_phone,  
                    },  
                ],  
            },  
        ]  
        res.json(ncco);  
    } else {  
        console.log('event status is: ', req.body.status);  
        console.log('event direction is: ', req.body.direction);  
        res.sendStatus(200);  
    }  
});  
  
app.get('/html', async (req, res) => {  
    var output=neru.getAppUrl();  
    output += "\n";  
    output += JSON.stringify(req.headers);  
    res.send(output);  
    // res.sendStatus(200);  
});  
  
app.listen(port, () => {  
    console.log(`App listening on port ${port}`)  
});  
