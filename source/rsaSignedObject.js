/**
 * RSA SignedObject usage
 * 
 * Signed Object Usage enables a user to wrap a any 
 * serializable object into a SHA256 RSA signed object
 * 
 * Signing a object ensure integrity from changes.  
 * 
 * You can use the signed object with SealedObject to 
 * encrypt your signed object
 */

var SignedObject = Java.type('java.security.SignedObject')
var Signature = Java.type('java.security.Signature')
var signingEngine = Signature.getInstance('SHA256withRSA');

// Loads the public key (.der) from the provided file path
function loadPublicKey(fileNamePath, setGlobal){
  var keyBytes = java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(fileNamePath))
  var spec = new java.security.spec.X509EncodedKeySpec(keyBytes)
  var kf = java.security.KeyFactory.getInstance("RSA")
  var publicKey = kf.generatePublic(spec)
  
  // Sets the global variable for Public Key usage
  if (setGlobal == true){
      PUBLIC_KEY = publicKey
  }
  return publicKey
}

// Loads the private key (.der) from the provided file path
function loadPrivateKey(fileNamePath, setGlobal){
  var keyBytes = java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(fileNamePath))
  var spec = new java.security.spec.PKCS8EncodedKeySpec(keyBytes)
  var kf = java.security.KeyFactory.getInstance("RSA")
  var privateKey = kf.generatePrivate(spec)
  
  // Sets the global variable for Private Key usage
  if (setGlobal == true){
    PRIVATE_KEY = privateKey
  }
  return privateKey
}

// Gets a system environment variable.  Primarily used for 
// getting the paths for the Public and Private .der files
function getEnvVar(variableName){
  return java.lang.System.getenv(variableName)
}

// Example loading Public and Private Key access from ENV vars:
// These lines can be removed if you dont need to auto-load Public and Private Keys
  loadPublicKey(getEnvVar('BPM_PUBLIC_KEY'), true)
  loadPrivateKey(getEnvVar('BPM_PRIVATE_KEY'), true)


/**
 * Create a SignedObject using a Object which can be serialized, and a privateKey
 * Default configuration is set to use SHA256withRSA for Signing
 * Expects private key to be a RSA private Key
 */
function signObject(objectToSign, privateKey) {
  var signedObject = new SignedObject(objectToSign, privateKey, signingEngine)
  return signedObject
}

function verifySignedObject(signedObjectToVerify, publicKey){
  var isVerified = signedObjectToVerify.verify(publicKey, signingEngine)
  return isVerified
}

/**
 * Example usage for creating a SignedObject
 */
// var myJsonJs = {
//   "someKey1": "someValue1",
//   "someKey2": [
//     {
//       "someInnerKey1": "someInnerValue1"
//     },
//     {
//       "someInnerKey2": "someInnerValue2"
//     }
//   ]
// }

  // Convert JSON into SPIN Object and convert SPIN Object into SignedObject
// var myJsonSpin = S(JSON.stringify(myJsonJs)) 
// var mySignedObject = signObject(myJsonSpin.toString(), PRIVATE_KEY)

  // Save the SignedObject as a process variable
// execution.setVariable('signedObject', mySignedObject)

  // Verify the SignedObject using the RSA Public Key
// var verified = verifySignedObject(mySignedObject, PUBLIC_KEY)

  // Save the Verification response (boolean) as a process variable
// execution.setVariable('verified1', verified)

/**
 * Get the SignedObject process variable, then verify the 
 * process variable using the public key, then save the 
 * verification response as a process variable
 */
// var signedObjectGet = execution.getVariable('signedObject')
// var verified2 = verifySignedObject(signedObjectGet, PUBLIC_KEY)
// execution.setVariable('verified2', verified2)


/**
 * Get object inside of the SignedObject and covert it into a 
 * String, then Parse that string back into a JS object, 
 * then stringify the JSON object back into a process variable 
 * as a String
 */
// var signedObjectJson = JSON.parse(signedObjectGet.getObject().toString())
// execution.setVariable('jsonString', JSON.stringify(signedObjectJson))

/**
 * References:
 * https://docs.oracle.com/javase/8/docs/api/java/security/SignedObject.html
 * https://docs.oracle.com/javase/8/docs/api/java/security/Signature.html
 */