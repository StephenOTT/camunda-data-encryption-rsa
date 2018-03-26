# Camunda BPM Process Variable RSA Encryption Pattern - Demo

The following is RSA encryption pattern for Camunda BPM variables using Nashorn Javascript

This is a demo deployment showing the execution of the encryption being called directly in a Script task.  In practice the rsaEncrypt.js file would be called through `load('classpath:rsaEncrypt.js')`

## What does it do?

This allows you to leverage RSA encryption (Public and Private Key Encryption) for Camunda process variables.  Any data that you can serialize you can pass into the `rsaSeal(message, PUBLIC_KEY)` function which will encrypt the `message` using the public key, and wrap it all in a Java [SealedObject](https://docs.oracle.com/javase/8/docs/api/javax/crypto/SealedObject.html)

The below are screenshots of Camunda BPM Cockput UI showing the possible variable type creations. Where `encrypted_content` and `decrypted_content` are raw Strings/text that are from RSA encryption.  `sealed_object` and `unsealed_object` are RSA encryptions with the SealedObject class usage.

It is recomended that the SealObject (`rsaSeal()`) function always be used becuase of the Camunda 4000 character limit on process variables of type `String`.

![cockpit](./screenshots/Cockpit.png)
![rsa raw](./screenshots/rsa_raw_inspect.png)
![sealed object serial](./screenshots/rsa_sealedobject_inspect_1_serial.png)
![sealed object deserial](./screenshots/rsa_sealedobject_inspect_2_deserial.png)


# Camunda Docker

```bash
  docker run -d \
            --name camunda \
            -p 8080:8080 \
            -v /Users/MyUser/docker_volumes/bpm_keys:/bpm_keys \
            -e BPM_PUBLIC_KEY=/bpm_keys/public_key.der \
            -e BPM_PRIVATE_KEY=/bpm_keys/private_key.der \
            camunda/camunda-bpm-platform:tomcat-7.8.0
```

The rsaEncrypt.js script is setup to load the public and private keys using paths provided by the `BPM_PUBLIC_KEY` and `BPM_PRIVATE_KEY` environment variables.


## Docker-Compose

Run: `docker-compose up`

Make sure to see the Environment Variables and the Volumes path for placing the .der / RSA Pem files.


## Dockerfile

For optimal usage, add the rsaEncrypt.js file to the classpath such as:

Tomcat usage:

```dockerfile
FROM camunda/camunda-bpm-platform:tomcat-7.8.0

# add custom configurations
COPY docker/camunda/conf/ /camunda/conf

# add JS script for RSA encryption
COPY docker/camunda/lib/rsaEncrypt.js /camunda/lib/rsaEncrypt.js
```


# RSA Keys / .der / .pem files

To Generate RSA .der files:

1. `openssl genrsa -out private_key.pem 4096`
1. `openssl pkcs8 -topk8 -inform PEM -outform DER -in private_key.pem -out private_key.der -nocrypt`
1. `openssl rsa -in private_key.pem -pubout -outform DER -out public_key.der`

Add these files to your `BPM_PUBLIC_KEY` and `BPM_PRIVATE_KEY` env variable mappings.

# Usage

Raw usage is as follows:

## Sealing/Encrypting:

```javascript
load('classpath:rsaEncrypt.js')
var messageToSeal = 'This message is to be hidden'

var sealedObject = rsaSeal(messageToSeal, PUBLIC_KEY)
execution.setVariable('sealed_object', sealedObject)
```

## Unsealing/Decrypting:

```javascript
load('classpath:rsaEncrypt.js')
var sealedObject = execution.getVariable('sealed_object')
var unsealedObject = rsaUnseal(sealedObject, PRIVATE_KEY)
execution.setVariable('unsealed_object', unsealedObject)
```

## Notes

When the `load('classpath:rsaEncrypt.js')` is called, the `PUBLIC_KEY` and `PRIVATE_KEY` variables are automatically populated based on the `env` variables, this can be updated manually with the `loadPublicKey()` and `loadPrivateKey()` functions.

**See the rsaEncrypt.js file for code comments and further customization examples.**