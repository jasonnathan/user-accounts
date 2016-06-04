*Acceptance Tests*

1. Acceptance tests are run using chimp
2. Ensure you have mocha installed
3. Run the meteor app as per instructions on the main readme

    npm install -g chimp
    npm install -g mocha
    chimp --ddp=http://localhost:3000 --mocha --path=tests browser=firefox // or chrome etc