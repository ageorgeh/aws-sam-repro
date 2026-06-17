# SAM local HTTP API authorizer CORS repro

Minimal AWS CDK v2 reproduction for a SAM CLI local HTTP API CORS issue. The
same Lambda function acts as a simple-response REQUEST authorizer and as the
`GET /hello` integration.

The authorizer permits only requests whose `Authorization` header is exactly
`allow`.

## Prerequisites

- Node.js and npm
- AWS CDK CLI (installed by `npm install`)
- AWS SAM CLI
- Docker, as required by `sam local`

## Run

```bash
npm ci 
npm run build
npx cdk synth
sam local start-api -t cdk.out/ReproStack.template.json
```

In another terminal, test the CORS preflight:

```bash
curl -i -X OPTIONS \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: GET' \
  http://127.0.0.1:3000/hello
```

Test an authorized request:

```bash
curl -i \
  -H 'Origin: http://localhost:5173' \
  -H 'Authorization: allow' \
  http://127.0.0.1:3000/hello
```

Test an unauthorized request:

```bash
curl -i \
  -H 'Origin: http://localhost:5173' \
  -H 'Authorization: deny' \
  http://127.0.0.1:3000/hello
```


## Observed output

### Preflight

```text
HTTP/1.1 200 OK
Server: Werkzeug/3.1.6 Python/3.13.13
Date: Wed, 17 Jun 2026 02:16:43 GMT
Content-Type: text/html; charset=utf-8
Content-Length: 0
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,OPTIONS
Access-Control-Allow-Headers: authorization,content-type
Connection: close
```

### Authorized GET

```text
HTTP/1.1 200 OK
Server: Werkzeug/3.1.6 Python/3.13.13
Date: Wed, 17 Jun 2026 02:17:07 GMT
content-type: application/json
Content-Length: 11
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,OPTIONS
Access-Control-Allow-Headers: authorization,content-type
Connection: close

{"ok":true}⏎   
```

### Unauthorized GET

```text
HTTP/1.1 403 FORBIDDEN
Server: Werkzeug/3.1.6 Python/3.13.13
Date: Wed, 17 Jun 2026 02:17:25 GMT
Content-Type: application/json
Content-Length: 61
Connection: close

{"message":"User is not authorized to access this resource"}
```


## Observed debug 

### Preflight

```text
2026-06-17 12:44:14 127.0.0.1 - - [17/Jun/2026 12:44:14] "OPTIONS /hello HTTP/1.1" 200 -
```

### Authorized GET

```text
2026-06-17 12:47:22,470 | Constructed Event Version 2.0 to invoke Lambda. Event: {'version': '2.0', 'routeKey': 'GET /hello', 'rawPath': '/hello', 'rawQueryString': '', 'cookies': [], 'headers': {'Host': '127.0.0.1:3050', 'User-Agent': 'curl/8.20.0', 'Accept': '*/*', 'Origin':                     
'http://localhost:5173', 'Authorization': 'allow', 'X-Forwarded-Proto': 'http', 'X-Forwarded-Port': '3050'}, 'requestContext': {'accountId': '123456789012', 'apiId': '1234567890', 'http': {'method': 'GET', 'path': '/hello', 'protocol': 'HTTP/1.1', 'sourceIp': '127.0.0.1', 'userAgent': 'Custom User
Agent String'}, 'requestId': '7c7808e7-201b-443d-bb4b-0be2e9f8223c', 'routeKey': 'GET /hello', 'stage': '$default', 'time': '17/Jun/2026:02:43:20 +0000', 'timeEpoch': 1781664200, 'domainName': 'localhost', 'domainPrefix': 'localhost'}, 'body': '', 'pathParameters': {}, 'stageVariables': None,     
'isBase64Encoded': False}                                                                                                                                                                                                                                                                                 
2026-06-17 12:47:22,474 | Constructed Event Version 2.0 to invoke Lambda. Event: {'version': '2.0', 'routeKey': 'GET /hello', 'rawPath': '/hello', 'rawQueryString': '', 'cookies': [], 'headers': {'Host': '127.0.0.1:3050', 'User-Agent': 'curl/8.20.0', 'Accept': '*/*', 'Origin':                     
'http://localhost:5173', 'Authorization': 'allow', 'X-Forwarded-Proto': 'http', 'X-Forwarded-Port': '3050'}, 'requestContext': {'accountId': '123456789012', 'apiId': '1234567890', 'http': {'method': 'GET', 'path': '/hello', 'protocol': 'HTTP/1.1', 'sourceIp': '127.0.0.1', 'userAgent': 'Custom User
Agent String'}, 'requestId': '7c7808e7-201b-443d-bb4b-0be2e9f8223c', 'routeKey': 'GET /hello', 'stage': '$default', 'time': '17/Jun/2026:02:43:20 +0000', 'timeEpoch': 1781664200, 'domainName': 'localhost', 'domainPrefix': 'localhost'}, 'body': '', 'pathParameters': {}, 'stageVariables': None,     
'isBase64Encoded': False}                                                                                                                                                                                                                                                                                 
2026-06-17 12:47:22,477 | Found one Lambda function with name 'Handler886CB40B'                                                                                                                                                                                                                           
2026-06-17 12:47:22,477 | Invoking index.handler (nodejs20.x)                                                                                                                                                                                                                                             
2026-06-17 12:47:22,478 | No environment variables found for function 'Handler886CB40B'                                                                                                                                                                                                                   
2026-06-17 12:47:22,478 | Loading AWS credentials from session with profile 'None'                                                                                                                                                                                                                        
2026-06-17 12:47:23,033 | Resolving code path. Cwd=/home/alex/code/sam-repro/cdk.out, CodeUri=/home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                    
2026-06-17 12:47:23,033 | Resolved absolute path to code is /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                                                      
2026-06-17 12:47:23,034 | Resolving code path. Cwd=/home/alex/code/sam-repro/cdk.out, CodeUri=/home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                    
2026-06-17 12:47:23,034 | Resolved real code path to /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                                                             
2026-06-17 12:47:23,035 | Code /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553 is not a zip/jar file                                                                                                                                             
2026-06-17 12:47:23,035 | ContainerClientFactory.create_client() called                                                                                                                                                                                                                                   
2026-06-17 12:47:23,035 | Admin preference: None                                                                                                                                                                                                                                                          
2026-06-17 12:47:23,036 | Using auto-detected client creation                                                                                                                                                                                                                                             
2026-06-17 12:47:23,036 | Trying Docker client creation                                                                                                                                                                                                                                                   
2026-06-17 12:47:23,036 | Creating Docker container client from environment variable.                                                                                                                                                                                                                     
2026-06-17 12:47:23,037 | Creating container client with parameters: {'version': '1.35'}                                                                                                                                                                                                                  
2026-06-17 12:47:23,037 | DockerContainerClient created successfully                                                                                                                                                                                                                                      
2026-06-17 12:47:23,038 | Fall back docker api version to 1.44: 400 Client Error for http+docker://localhost/v1.35/_ping: Bad Request ("client version 1.35 is too old. Minimum supported API version is 1.40, please upgrade your client to a newer version")                                            
2026-06-17 12:47:23,041 | Docker daemon check succeeded with fallback: 400 Client Error for http+docker://localhost/v1.35/_ping: Bad Request ("client version 1.35 is too old. Minimum supported API version is 1.40, please upgrade your client to a newer version")                                     
2026-06-17 12:47:23,042 | Using Docker as Container Engine.                                                                                                                                                                                                                                               
2026-06-17 12:47:23,042 | Set global container socket path: container_socket_path=                                                                                                                                                                                                                        
2026-06-17 12:47:25,002 | Local image is up-to-date                                                                                                                                                                                                                                                       
2026-06-17 12:47:25,008 | Checking free port on 127.0.0.1:5654                                                                                                                                                                                                                                            
2026-06-17 12:47:25,009 | Using local image: public.ecr.aws/lambda/nodejs:20-rapid-x86_64.                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                          
2026-06-17 12:47:25,011 | Mounting /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553 as /var/task:ro,delegated, inside runtime container                                                                                                           
2026-06-17 12:47:25,013 | ContainerClientFactory.create_client() called                                                                                                                                                                                                                                   
2026-06-17 12:47:25,014 | Admin preference: None                                                                                                                                                                                                                                                          
2026-06-17 12:47:25,014 | Using auto-detected client creation                                                                                                                                                                                                                                             
2026-06-17 12:47:25,015 | Trying Docker client creation                                                                                                                                                                                                                                                   
2026-06-17 12:47:25,016 | Creating Docker container client from environment variable.                                                                                                                                                                                                                     
2026-06-17 12:47:25,017 | Creating container client with parameters: {'version': '1.35'}                                                                                                                                                                                                                  
2026-06-17 12:47:25,018 | DockerContainerClient created successfully                                                                                                                                                                                                                                      
2026-06-17 12:47:25,019 | Fall back docker api version to 1.44: 400 Client Error for http+docker://localhost/v1.35/_ping: Bad Request ("client version 1.35 is too old. Minimum supported API version is 1.40, please upgrade your client to a newer version")                                            
2026-06-17 12:47:25,021 | Docker daemon check succeeded with fallback: 400 Client Error for http+docker://localhost/v1.35/_ping: Bad Request ("client version 1.35 is too old. Minimum supported API version is 1.40, please upgrade your client to a newer version")                                     
2026-06-17 12:47:25,021 | Using Docker as Container Engine.                                                                                                                                                                                                                                               
2026-06-17 12:47:25,022 | Set global container socket path: container_socket_path=                                                                                                                                                                                                                        
2026-06-17 12:47:25,034 | SAM_CONTAINER_ID: 30dede5d7531bd6077048cfe524c5a38a9df1e7f44bdffffcaf0a0cb6bdcb2fb                                                                                                                                                                                              
2026-06-17 12:47:25,035 | Initialized container 30dede5d7531bd6077048cfe524c5a38a9df1e7f44bdffffcaf0a0cb6bdcb2fb with max_concurrency=1                                                                                                                                                                   
2026-06-17 12:47:25,219 | Starting a timer for 3 seconds for function 'Handler'                                                                                                                                                                                                                           
2026-06-17 12:47:25,221 | Container-30dede5d7531 (concurrency available: 1/1) - ALLOWED for request ({"body": "", "cookies": [], "headers": {"Accept": "*/*", "Authorization": "allow", "Host": "127.0.0.1:3050", "Origin": "http://localhost:5173", "User-Agent": "curl/8.20.0", "X-Forwarded-Port":     
"3050", "X-Forwarded-Proto": "http"}, "identitySource": ["allow"], "isBase64Encoded": false, "pathParameters": {}, "rawPath": "/hello", "rawQueryString": "", "requestContext": {"accountId": "123456789012", "apiId": "1234567890", "domainName": "localhost", "domainPrefix": "localhost", "http":      
{"method": "GET", "path": "/hello", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "Custom User Agent String"}, "requestId": "7c7808e7-201b-443d-bb4b-0be2e9f8223c", "routeKey": "GET /hello", "stage": "$default", "time": "17/Jun/2026:02:43:20 +0000", "timeEpoch": 1781664200},        
"routeArn": "arn:aws:execute-api:us-east-1:123456789012:1234567890/$default/GET/hello", "routeKey": "GET /hello", "stageVariables": null, "type": "REQUEST", "version": "2.0"})                                                                                                                           
START RequestId: aa7ec435-0c09-4f1e-838d-819dbb7e156d Version: $LATEST
START RequestId: aa7ec435-0c09-4f1e-838d-819dbb7e156d Version: $LATEST
END RequestId: aa7ec435-0c09-4f1e-838d-819dbb7e156d
REPORT RequestId: aa7ec435-0c09-4f1e-838d-819dbb7e156d  Init Duration: 0.02 ms  Duration: 44.51 ms      Billed Duration: 45 ms  Memory Size: 128 MB     Max Memory Used: 128 MB

2026-06-17 12:47:25,271 | [Container state] OOMKilled False                                                                                                                                                                                                                                               
2026-06-17 12:47:25,486 | Cleaning all decompressed code dirs                                                                                                                                                                                                                                             
2026-06-17 12:47:25,488 | Unable to find Click Context for getting session_id.                                                                                                                                                                                                                            
2026-06-17 12:47:25,491 | Found one Lambda function with name 'Handler886CB40B'                                                                                                                                                                                                                           
2026-06-17 12:47:25,493 | Invoking index.handler (nodejs20.x)                                                                                                                                                                                                                                             
2026-06-17 12:47:25,495 | No environment variables found for function 'Handler886CB40B'                                                                                                                                                                                                                   
2026-06-17 12:47:25,496 | Resolving code path. Cwd=/home/alex/code/sam-repro/cdk.out, CodeUri=/home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                    
2026-06-17 12:47:25,498 | Resolved absolute path to code is /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                                                      
2026-06-17 12:47:25,499 | Resolving code path. Cwd=/home/alex/code/sam-repro/cdk.out, CodeUri=/home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                    
2026-06-17 12:47:25,499 | Resolved real code path to /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                                                             
2026-06-17 12:47:25,500 | Code /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553 is not a zip/jar file                                                                                                                                             
2026-06-17 12:47:25,505 | Checking free port on 127.0.0.1:5746                                                                                                                                                                                                                                            
2026-06-17 12:47:25,506 | Using local image: public.ecr.aws/lambda/nodejs:20-rapid-x86_64.                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                          
2026-06-17 12:47:25,507 | Mounting /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553 as /var/task:ro,delegated, inside runtime container                                                                                                           
2026-06-17 12:47:25,507 | ContainerClientFactory.create_client() called                                                                                                                                                                                                                                   
2026-06-17 12:47:25,508 | Admin preference: None                                                                                                                                                                                                                                                          
2026-06-17 12:47:25,508 | Using auto-detected client creation                                                                                                                                                                                                                                             
2026-06-17 12:47:25,508 | Trying Docker client creation                                                                                                                                                                                                                                                   
2026-06-17 12:47:25,509 | Creating Docker container client from environment variable.                                                                                                                                                                                                                     
2026-06-17 12:47:25,509 | Creating container client with parameters: {'version': '1.35'}                                                                                                                                                                                                                  
2026-06-17 12:47:25,510 | DockerContainerClient created successfully                                                                                                                                                                                                                                      
2026-06-17 12:47:25,511 | Fall back docker api version to 1.44: 400 Client Error for http+docker://localhost/v1.35/_ping: Bad Request ("client version 1.35 is too old. Minimum supported API version is 1.40, please upgrade your client to a newer version")                                            
2026-06-17 12:47:25,512 | Docker daemon check succeeded with fallback: 400 Client Error for http+docker://localhost/v1.35/_ping: Bad Request ("client version 1.35 is too old. Minimum supported API version is 1.40, please upgrade your client to a newer version")                                     
2026-06-17 12:47:25,512 | Using Docker as Container Engine.                                                                                                                                                                                                                                               
2026-06-17 12:47:25,513 | Set global container socket path: container_socket_path=                                                                                                                                                                                                                        
2026-06-17 12:47:25,522 | SAM_CONTAINER_ID: 5b6c42ac05e264803f822bee246b8d280c7d921c9a4c3993f2c4708b5e37c4ca                                                                                                                                                                                              
2026-06-17 12:47:25,522 | Initialized container 5b6c42ac05e264803f822bee246b8d280c7d921c9a4c3993f2c4708b5e37c4ca with max_concurrency=1                                                                                                                                                                   
2026-06-17 12:47:25,713 | Starting a timer for 3 seconds for function 'Handler'                                                                                                                                                                                                                           
2026-06-17 12:47:25,717 | Container-5b6c42ac05e2 (concurrency available: 1/1) - ALLOWED for request ({"body": "", "cookies": [], "headers": {"Accept": "*/*", "Authorization": "allow", "Host": "127.0.0.1:3050", "Origin": "http://localhost:5173", "User-Agent": "curl/8.20.0", "X-Forwarded-Port":     
"3050", "X-Forwarded-Proto": "http"}, "isBase64Encoded": false, "pathParameters": {}, "rawPath": "/hello", "rawQueryString": "", "requestContext": {"accountId": "123456789012", "apiId": "1234567890", "authorizer": {"lambda": {"reason": "allowed"}}, "domainName": "localhost", "domainPrefix":       
"localhost", "http": {"method": "GET", "path": "/hello", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "Custom User Agent String"}, "requestId": "7c7808e7-201b-443d-bb4b-0be2e9f8223c", "routeKey": "GET /hello", "stage": "$default", "time": "17/Jun/2026:02:43:20 +0000", "timeEpoch":
1781664200}, "routeKey": "GET /hello", "stageVariables": null, "version": "2.0"})                                                                                                                                                                                                                         
START RequestId: 08227376-370a-413c-a292-16213281603a Version: $LATEST
START RequestId: 08227376-370a-413c-a292-16213281603a Version: $LATEST
END RequestId: 08227376-370a-413c-a292-16213281603a
REPORT RequestId: 08227376-370a-413c-a292-16213281603a  Init Duration: 0.09 ms  Duration: 58.60 ms      Billed Duration: 59 ms  Memory Size: 128 MB     Max Memory Used: 128 MB

2026-06-17 12:47:25,792 | [Container state] OOMKilled False                                                                                                                                                                                                                                               
2026-06-17 12:47:26,009 | Cleaning all decompressed code dirs                                                                                                                                                                                                                                             
2026-06-17 12:47:26 127.0.0.1 - - [17/Jun/2026 12:47:26] "GET /hello HTTP/1.1" 200 -

```

### Unauthorized GET

```text
2026-06-17 12:48:38,873 | Constructed Event Version 2.0 to invoke Lambda. Event: {'version': '2.0', 'routeKey': 'GET /hello', 'rawPath': '/hello', 'rawQueryString': '', 'cookies': [], 'headers': {'Host': '127.0.0.1:3050', 'User-Agent': 'curl/8.20.0', 'Accept': '*/*', 'Origin':                     
'http://localhost:5173', 'Authorization': 'deny', 'X-Forwarded-Proto': 'http', 'X-Forwarded-Port': '3050'}, 'requestContext': {'accountId': '123456789012', 'apiId': '1234567890', 'http': {'method': 'GET', 'path': '/hello', 'protocol': 'HTTP/1.1', 'sourceIp': '127.0.0.1', 'userAgent': 'Custom User 
Agent String'}, 'requestId': '3ce61e1f-6fc7-4bac-b5aa-375bca644cd9', 'routeKey': 'GET /hello', 'stage': '$default', 'time': '17/Jun/2026:02:48:32 +0000', 'timeEpoch': 1781664512, 'domainName': 'localhost', 'domainPrefix': 'localhost'}, 'body': '', 'pathParameters': {}, 'stageVariables': None,     
'isBase64Encoded': False}                                                                                                                                                                                                                                                                                 
2026-06-17 12:48:38,876 | Constructed Event Version 2.0 to invoke Lambda. Event: {'version': '2.0', 'routeKey': 'GET /hello', 'rawPath': '/hello', 'rawQueryString': '', 'cookies': [], 'headers': {'Host': '127.0.0.1:3050', 'User-Agent': 'curl/8.20.0', 'Accept': '*/*', 'Origin':                     
'http://localhost:5173', 'Authorization': 'deny', 'X-Forwarded-Proto': 'http', 'X-Forwarded-Port': '3050'}, 'requestContext': {'accountId': '123456789012', 'apiId': '1234567890', 'http': {'method': 'GET', 'path': '/hello', 'protocol': 'HTTP/1.1', 'sourceIp': '127.0.0.1', 'userAgent': 'Custom User 
Agent String'}, 'requestId': '3ce61e1f-6fc7-4bac-b5aa-375bca644cd9', 'routeKey': 'GET /hello', 'stage': '$default', 'time': '17/Jun/2026:02:48:32 +0000', 'timeEpoch': 1781664512, 'domainName': 'localhost', 'domainPrefix': 'localhost'}, 'body': '', 'pathParameters': {}, 'stageVariables': None,     
'isBase64Encoded': False}                                                                                                                                                                                                                                                                                 
2026-06-17 12:48:38,878 | Found one Lambda function with name 'Handler886CB40B'                                                                                                                                                                                                                           
2026-06-17 12:48:38,879 | Invoking index.handler (nodejs20.x)                                                                                                                                                                                                                                             
2026-06-17 12:48:38,879 | No environment variables found for function 'Handler886CB40B'                                                                                                                                                                                                                   
2026-06-17 12:48:38,880 | Loading AWS credentials from session with profile 'None'                                                                                                                                                                                                                        
2026-06-17 12:48:39,421 | Resolving code path. Cwd=/home/alex/code/sam-repro/cdk.out, CodeUri=/home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                    
2026-06-17 12:48:39,425 | Resolved absolute path to code is /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                                                      
2026-06-17 12:48:39,427 | Resolving code path. Cwd=/home/alex/code/sam-repro/cdk.out, CodeUri=/home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                    
2026-06-17 12:48:39,430 | Resolved real code path to /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553                                                                                                                                             
2026-06-17 12:48:39,431 | Code /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553 is not a zip/jar file                                                                                                                                             
2026-06-17 12:48:39,431 | ContainerClientFactory.create_client() called                                                                                                                                                                                                                                   
2026-06-17 12:48:39,432 | Admin preference: None                                                                                                                                                                                                                                                          
2026-06-17 12:48:39,432 | Using auto-detected client creation                                                                                                                                                                                                                                             
2026-06-17 12:48:39,432 | Trying Docker client creation                                                                                                                                                                                                                                                   
2026-06-17 12:48:39,433 | Creating Docker container client from environment variable.                                                                                                                                                                                                                     
2026-06-17 12:48:39,433 | Creating container client with parameters: {'version': '1.35'}                                                                                                                                                                                                                  
2026-06-17 12:48:39,434 | DockerContainerClient created successfully                                                                                                                                                                                                                                      
2026-06-17 12:48:39,435 | Fall back docker api version to 1.44: 400 Client Error for http+docker://localhost/v1.35/_ping: Bad Request ("client version 1.35 is too old. Minimum supported API version is 1.40, please upgrade your client to a newer version")                                            
2026-06-17 12:48:39,436 | Docker daemon check succeeded with fallback: 400 Client Error for http+docker://localhost/v1.35/_ping: Bad Request ("client version 1.35 is too old. Minimum supported API version is 1.40, please upgrade your client to a newer version")                                     
2026-06-17 12:48:39,436 | Using Docker as Container Engine.                                                                                                                                                                                                                                               
2026-06-17 12:48:39,437 | Set global container socket path: container_socket_path=                                                                                                                                                                                                                        
2026-06-17 12:48:41,363 | Local image is up-to-date                                                                                                                                                                                                                                                       
2026-06-17 12:48:41,375 | Checking free port on 127.0.0.1:7695                                                                                                                                                                                                                                            
2026-06-17 12:48:41,382 | Using local image: public.ecr.aws/lambda/nodejs:20-rapid-x86_64.                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                          
2026-06-17 12:48:41,384 | Mounting /home/alex/code/sam-repro/cdk.out/asset.f9ab93a0286a54a3c666cab56ffb6fbbde67a3c6bd468da65585b1b892395553 as /var/task:ro,delegated, inside runtime container                                                                                                           
2026-06-17 12:48:41,385 | ContainerClientFactory.create_client() called                                                                                                                                                                                                                                   
2026-06-17 12:48:41,386 | Admin preference: None                                                                                                                                                                                                                                                          
2026-06-17 12:48:41,387 | Using auto-detected client creation                                                                                                                                                                                                                                             
2026-06-17 12:48:41,388 | Trying Docker client creation                                                                                                                                                                                                                                                   
2026-06-17 12:48:41,388 | Creating Docker container client from environment variable.                                                                                                                                                                                                                     
2026-06-17 12:48:41,389 | Creating container client with parameters: {'version': '1.35'}                                                                                                                                                                                                                  
2026-06-17 12:48:41,390 | DockerContainerClient created successfully                                                                                                                                                                                                                                      
2026-06-17 12:48:41,391 | Fall back docker api version to 1.44: 400 Client Error for http+docker://localhost/v1.35/_ping: Bad Request ("client version 1.35 is too old. Minimum supported API version is 1.40, please upgrade your client to a newer version")                                            
2026-06-17 12:48:41,392 | Docker daemon check succeeded with fallback: 400 Client Error for http+docker://localhost/v1.35/_ping: Bad Request ("client version 1.35 is too old. Minimum supported API version is 1.40, please upgrade your client to a newer version")                                     
2026-06-17 12:48:41,393 | Using Docker as Container Engine.                                                                                                                                                                                                                                               
2026-06-17 12:48:41,393 | Set global container socket path: container_socket_path=                                                                                                                                                                                                                        
2026-06-17 12:48:41,408 | SAM_CONTAINER_ID: 30eb9793fc07843f3d0c7569e0bd5e7537afe0e32c8f65463323253b9f4c3cd8                                                                                                                                                                                              
2026-06-17 12:48:41,408 | Initialized container 30eb9793fc07843f3d0c7569e0bd5e7537afe0e32c8f65463323253b9f4c3cd8 with max_concurrency=1                                                                                                                                                                   
2026-06-17 12:48:41,557 | Starting a timer for 3 seconds for function 'Handler'                                                                                                                                                                                                                           
2026-06-17 12:48:41,559 | Container-30eb9793fc07 (concurrency available: 1/1) - ALLOWED for request ({"body": "", "cookies": [], "headers": {"Accept": "*/*", "Authorization": "deny", "Host": "127.0.0.1:3050", "Origin": "http://localhost:5173", "User-Agent": "curl/8.20.0", "X-Forwarded-Port":      
"3050", "X-Forwarded-Proto": "http"}, "identitySource": ["deny"], "isBase64Encoded": false, "pathParameters": {}, "rawPath": "/hello", "rawQueryString": "", "requestContext": {"accountId": "123456789012", "apiId": "1234567890", "domainName": "localhost", "domainPrefix": "localhost", "http":       
{"method": "GET", "path": "/hello", "protocol": "HTTP/1.1", "sourceIp": "127.0.0.1", "userAgent": "Custom User Agent String"}, "requestId": "3ce61e1f-6fc7-4bac-b5aa-375bca644cd9", "routeKey": "GET /hello", "stage": "$default", "time": "17/Jun/2026:02:48:32 +0000", "timeEpoch": 1781664512},        
"routeArn": "arn:aws:execute-api:us-east-1:123456789012:1234567890/$default/GET/hello", "routeKey": "GET /hello", "stageVariables": null, "type": "REQUEST", "version": "2.0"})                                                                                                                           
START RequestId: c4853914-0b58-4d16-b0a3-d75a898dc4f0 Version: $LATEST
START RequestId: c4853914-0b58-4d16-b0a3-d75a898dc4f0 Version: $LATEST
END RequestId: c4853914-0b58-4d16-b0a3-d75a898dc4f0
REPORT RequestId: c4853914-0b58-4d16-b0a3-d75a898dc4f0  Init Duration: 0.02 ms  Duration: 44.89 ms      Billed Duration: 45 ms  Memory Size: 128 MB     Max Memory Used: 128 MB

2026-06-17 12:48:41,610 | [Container state] OOMKilled False                                                                                                                                                                                                                                               
2026-06-17 12:48:41,785 | Cleaning all decompressed code dirs                                                                                                                                                                                                                                             
2026-06-17 12:48:41,787 | Unable to find Click Context for getting session_id.                                                                                                                                                                                                                            
2026-06-17 12:48:41,790 | Lambda authorizer failed to invoke successfully: Request is not authorized for arn:aws:execute-api:us-east-1:123456789012:1234567890/$default/GET/hello                                                                                                                         
2026-06-17 12:48:41 127.0.0.1 - - [17/Jun/2026 12:48:41] "GET /hello HTTP/1.1" 403 -
```
