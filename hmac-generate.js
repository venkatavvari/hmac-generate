/**
 * Postman pre-request script to generate HMAC tokens
 *
 * Ensure you have environment variable 'api.secret' configured with your supplied API secret.
 *
 */

function calcMd5(data) {
    const md5digest = CryptoJS.MD5(data);
    return CryptoJS.enc.Base64.stringify(md5digest);
}

function calcHmac(message, secret) {
    const hash = CryptoJS.HmacSHA256(message, secret);
    return CryptoJS.enc.Base64.stringify(hash);
}

const timestamp = new Date().toISOString();
const uri = request.url.trim().replace(new RegExp('^(https?://[^\/]+/)|(^{{.*}}/)'), '/');
const verb = request.method;
const contentType = request.headers["content-type"];

var message, md5;

if (!_.isEmpty(request.data)) {
    md5 = calcMd5(request.data);
    message = verb + "\n" + timestamp + "\n" + uri + "\n" + contentType + "\n" + md5;
} else {
    message = verb + "\n" + timestamp + "\n" + uri;
}

const secret = environment['api.secret'];

const signature = calcHmac(message, secret);

postman.setEnvironmentVariable('hmac.signature', signature);
postman.setEnvironmentVariable('hmac.timestamp', timestamp);
postman.setEnvironmentVariable('hmac.md5', md5);

/*
 *
 * Use below code to dump all signature information into the Postman console, we have a test utility
 * that can read this content and validate it with the actual module that drives hmac authentication
 * on the API gateway.
 *
 */

const verify = {
    "verb": verb,
    "timestamp": timestamp,
    "uri": uri,
    "content_type": contentType,
    "md5": md5,
    "data_b64": CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(request.data)),
    'apikey': environment['api.key'],
    'secret': secret,
    'message_b64': CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(message)),
    'signature': signature
};

console.log(JSON.stringify(verify));