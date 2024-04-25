# Drop Wallet REST API

The REST API to the drop-wallet is described below.

## Get Balance of Account

### Request

`GET /account/balance`

    curl -i -H 'Accept: application/json' http://localhost:3000/account/balance

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    {balance:0}

## Mint NFT

### Request

`POST /nft/mint`

    curl -i -X POST -H "Content-Type: multipart/form-data" -F "data=@nft.jpg"  
    http://localhost:3000/nft/mint
### Response

    HTTP/1.1 201 Created
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 201 Created
    Connection: close
    Content-Type: multipart/form-data
    Location: /nft/mint
    Content-Length: 36

    {status : 200, message : "success"}
    
## Send NFT

### Request

`POST /nft/send`

    curl -d '{"NftAddress":"aD2c1x", "receiver":"receiver.near"}' -H "Content-Type: application/json" -X POST http://localhost:3000/nft/send

### Response

    HTTP/1.1 201 Created
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 201 Created
    Connection: close
    Content-Type: application/x-www-form-urlencoded
    Location: /nft/mint
    Content-Length: 36

    {status : 200, message : "success"}
    
## Tranfer Token

### Request

`POST /token/send`

    curl -d "@nft.jpg" -X POST http://localhost:3000/nft/mint
    

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 36

    {status : 200, message : "success"}
    
## Create Social Near Post

### Request

`POST /social/create`

    curl -i -X POST -H "Content-Type: multipart/form-data" -F "data=@picture.jpg"  
    http://localhost:3000/social/create

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 36

    {status : 200, message : "success"}


