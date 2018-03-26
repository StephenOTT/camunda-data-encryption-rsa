/*
RSA Encryption usage for Camunda BPM

To Generate RSA .der files:
1. openssl genrsa -out private_key.pem 4096
2. openssl pkcs8 -topk8 -inform PEM -outform DER -in private_key.pem -out private_key.der -nocrypt
3. openssl rsa -in private_key.pem -pubout -outform DER -out public_key.der

References:
RSA file (.der) generation: https://stackoverflow.com/questions/11787571/how-to-read-pem-file-to-get-private-and-public-key/14177328
RSA Code usage: https://www.veracode.com/blog/research/encryption-and-decryption-java-cryptography
                https://github.com/1MansiS/java_crypto/blob/master/cipher/SecuredRSAUsage.java


@TODO:
1. Add support for traking the version of RSA keys
2. Add RSA Key Version as a String based process variable 
    so process instances that use specific versions of encryption 
    can be found

*/

var SealedObject = Java.type('javax.crypto.SealedObject')
var Cipher = Java.type('javax.crypto.Cipher')


var RSA_KEY_LENGTH = 4096
var ALGORITHM_NAME = "RSA"
var PADDING_SCHEME = "OAEPWITHSHA-512ANDMGF1PADDING"
var MODE_OF_OPERATION = "ECB" // This essentially means none behind the scene

// ~Global Variables to store Public and Private Keys 
// when using rsaEncrypt() and rsaDecrypt()
var PUBLIC_KEY
var PRIVATE_KEY

function rsaEncrypt(message, publicKey){
  // USAGE: rsaEncrypt(shortMessage, rsaKeyPair.getPublic());
  var c = Cipher.getInstance(ALGORITHM_NAME + "/" + MODE_OF_OPERATION + "/" + PADDING_SCHEME)
  c.init(Cipher.ENCRYPT_MODE, publicKey)
  var cipherTextArray = c.doFinal(message.getBytes())
  return java.util.Base64.getEncoder().encodeToString(cipherTextArray)
}

// SealedObject RSA Encryption
function rsaSeal(message, publicKey){
  var c = Cipher.getInstance(ALGORITHM_NAME + "/" + MODE_OF_OPERATION + "/" + PADDING_SCHEME)
  c.init(Cipher.ENCRYPT_MODE, publicKey)
  var sealedObject = new SealedObject(message, c)
  return sealedObject
}

function rsaUnseal(sealedObject, privateKey){
  var unsealed = sealedObject.getObject(privateKey)
  return unsealed
}

// Decrypt Message
function rsaDecrypt(encryptedMessage, privateKey, decode){
  decode = decode || true
  
  if (decode == true){
    encryptedMessage = java.util.Base64.getDecoder().decode(encryptedMessage)
  }

  var c = Cipher.getInstance(ALGORITHM_NAME + "/" + MODE_OF_OPERATION + "/" + PADDING_SCHEME)
  c.init(Cipher.DECRYPT_MODE, privateKey)
  var plainText = c.doFinal(encryptedMessage)

  return new java.lang.String(plainText)
}

// Generate a RSA Key Pair (Mainly used for internal testing)
function generateRsaKeys(){
  var rsaKeyGen = java.security.KeyPairGenerator.getInstance(ALGORITHM_NAME)
  rsaKeyGen.initialize(RSA_KEY_LENGTH)
  var rsaKeyPair = rsaKeyGen.generateKeyPair() // java.security.KeyPair
  // rsaKeyPair.getPublic()
  // rsaKeyPair.getPrivate()

  return rsaKeyPair
}

// Loads the public key (.der) from the provided file path
function loadPublicKey(fileNamePath, setGlobal){
  var keyBytes = java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(fileNamePath))
  java.lang.System.out.println(keyBytes.toString())
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
  java.lang.System.out.println(keyBytes)
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
  loadPublicKey(getEnvVar('BPM_PUBLIC_KEY'), true)
  loadPrivateKey(getEnvVar('BPM_PRIVATE_KEY'), true)

// Example of loading Public and Private key from defined path:
  // loadPublicKey('/bpm_keys/public_key.der', true)
  // loadPrivateKey('/bpm_keys/private_key.der', true)

// A sample message for encryption
// Used during testing
  // var shortMessage = 'This message is to be hidden'

// Example of Encrypting using RSA Keys and the global PUBLIC_KEY variable
  // var encryptedMessage = rsaEncrypt(shortMessage, PUBLIC_KEY)
  // execution.setVariable('encrypted_content', encryptedMessage)

// Example of Decrypting using RSA Keys and the global PRIVATE_KEY variable
  // var camunda_encrypted_variable = execution.getVariable('encrypted_content')
  // var decryptedMesaage = rsaDecrypt(camunda_encrypted_variable, PRIVATE_KEY, true)
  // execution.setVariable('decrypted_content', decryptedMesaage)

// Example of SealedObject Usage with RSA Public Key
  // var seal1 = rsaSeal(shortMessage, PUBLIC_KEY)
  // execution.setVariable('sealed_object', seal1)

// Example of UnSealing a SealedObject using RSA Private Key
  // var seal2 = execution.getVariable('sealed_object')
  // var unseal_seal2 = rsaUnseal(seal2, PRIVATE_KEY)
  // execution.setVariable('unsealed_object', unseal_seal2)

/*
Sample for running camunda with default BPM Key variable names
  docker run -d \
            --name camunda \
            -p 8080:8080 \
            -v /Users/MyUser/docker_volumes/bpm_keys:/bpm_keys \
            -e BPM_PUBLIC_KEY=/bpm_keys/public_key.der \
            -e BPM_PRIVATE_KEY=/bpm_keys/private_key.der \
            camunda/camunda-bpm-platform:tomcat-7.8.0
*/
