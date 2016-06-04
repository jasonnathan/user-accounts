# user-accounts
An example of how to customise Meteor Accounts without the need for 3rd party accounts management

1. Install Meteor for windows, please see https://www.meteor.com/install.
2. Clone this repository
3. Export environment variables
4. Run NPM install and then meteor.

*setup*

    export MAIL_URL="smtp://user:pass@smtp.yourprovider.com:587"
    export DEFAULT_FNAME="Jason"
    export DEFAULT_LNAME="Nathan"
    export DEFAULT_EMAIL="me@example.com"
    export DEFAULT_PASS="PASSWORD"

*installation*

    curl https://install.meteor.com/ | sh
    git clone https://github.com/jasonnathan/user-accounts && cd user-accounts
    npm install
    meteor


*For deployment*

1. Please run meteor build for you architecture #see http://guide.meteor.com/deployment.html#custom-deployment


*Notes for SMS verification Implementation*
1. Create another environment for SMS gateway credentials
2. Create another module like the Emailer module in `/imports/startup/server/Email.js` that sends out an SMS
3. Create a server method in `/imports/api/account-methods.js` similar to `accounts.sendVerificationEmail` that generates and stores a token and then calls on the former method to send out the SMS.
4. Create a method similar to `https://github.com/meteor/meteor/blob/master/packages/accounts-password/password_server.js#L802` that verifies a given token also in `/imports/api/account-methods.js` that is called in the client when a SMS token is entered.

