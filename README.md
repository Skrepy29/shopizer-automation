# Shopizer 3 (for java 17 +) (tested with Java 11, 17)

3.2.7



[![last_version](https://img.shields.io/badge/last_version-v3.2.7-blue.svg?style=flat)](https://github.com/shopizer-ecommerce/shopizer/tree/3.2.7)
[![Official site](https://img.shields.io/website-up-down-green-red/https/shields.io.svg?label=official%20site)](http://www.shopizer.com/)
[![Docker Pulls](https://img.shields.io/docker/pulls/shopizerecomm/shopizer.svg)](https://hub.docker.com/r/shopizerecomm/shopizer)
[![stackoverflow](https://img.shields.io/badge/shopizer-stackoverflow-orange.svg?style=flat)](http://stackoverflow.com/questions/tagged/shopizer)
[![CircleCI](https://circleci.com/gh/shopizer-ecommerce/shopizer.svg?style=svg)](https://circleci.com/gh/shopizer-ecommerce/shopizer)


Java open source e-commerce software

Futtatás:

1.  Run from Docker images:

From the command line:

```
docker run -p 8080:8080 shopizerecomm/shopizer:latest
```
       
2. Run the administration tool

⋅⋅⋅ Requires the java backend to be running

```
docker run \
 -e "APP_BASE_URL=http://localhost:8080/api" \
 -p 82:80 shopizerecomm/shopizer-admin
```


3. Run react shop sample site

⋅⋅⋅ Requires the java backend to be running

```
docker run \
 -e "APP_MERCHANT=DEFAULT" \
 -e "APP_BASE_URL=http://localhost:8080" \
 -p 80:80 shopizerecomm/shopizer-shop-reactjs
```

Tesztek futtatása
-------------------
1. Cypress 
```
npx cypress open
```
2. Playwright
```
npx playwright test --ui
```
3. Selenium
```
npm test
```

Get the source code:
-------------------
Clone the repository:
     
	 $ git clone git://github.com/shopizer-ecommerce/shopizer.git
	 

To build the application:
-------------------

1. Shopizer backend


From the command line:

	$ cd shopizer
	$ mvnw clean install
	$ cd sm-shop
	$ mvnw spring-boot:run

2. Shopizer admin

Form compiling and running Shopizer admin consult the repo README file

3. Shop sample site

Form compiling and running Shopizer admin consult the repo README file


### Access the application:
-------------------

Access the headless web application at: http://localhost:8080/swagger-ui.html


The instructions above will let you run the application with default settings and configurations.
Please read the instructions on how to connect to MySQL, configure an email server and configure other subsystems




