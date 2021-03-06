import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { _ } from 'lodash';
import Emailer from '/imports/startup/server/email.js';


Meteor.methods({

    /**
     * A simple method that finds a user by his email or throws an error 
     * if one is found
     * 
     * @param  {String} email A valid email address
     */
    'accounts.findByEmail': function(email) {
        check(email, String);
        let user = Accounts.findUserByEmail(email);

        if (!!user) {
            throw new Meteor.Error(403, "Sorry that email already exists, please try another email address")
        }

        return true;
    },

    /**
     * Almost identical to the one above, except that it returns a user id if an email is found
     * and throws an error if there isn't an account associated with the email
     *
     * @param  {String} email A valid email address
     * @return {String}       The user id of the found user
     */
    'accounts.checkEmailExists': function(email){
        check(email, String);
        let user = Accounts.findUserByEmail(email);

        if (!user) {
            throw new Meteor.Error(403, "We couldn't find an account associated with that email address")
        }

        return user._id;
    },

    /**
     * This method is also available on the client but creating a custom method here as per requirements.
     * An example of sending out a customised email is called in this method
     * 
     * @param  {Object} params an object containing email, password
     */
    'accounts.createUser': function(params){
        check(params.email, String);
        check(params.password, Object);

        // This method allows hashed passwords, it then bcrypts the hash before it goes into the DB
        let _id = Accounts.createUser({
            email: params.email,
            password: params.password
        });

        return Meteor.call('accounts.sendVerificationEmail', _id);
    },

    /**
     * Send the user an email informing them that their account was created, with
     * a link that when opened marks their email as verified.
     *
     * See adaptation from [(accounts-password/password_server.js, line 595)]
     * {@link https://github.com/meteor/meteor/blob/master/packages/accounts-password/password_server.js#L595}.
     *
     * @summary Send an email with a link to verify his/her email
     * @locus Server
     * @param {String} userId The id of the user to send email to.
     */
    'accounts.sendVerificationEmail': function(userId) {
        check(userId, String);
        /**
         * @link https://meteorhacks.com/understanding-meteor-wait-time-and-this-unblock/
         */
        this.unblock();

        let user = Meteor.users.findOne(userId),
            // placeholder so it doesn't throw here if user isn't found
            email;

        if (!user) {
            // throw bad request
            throw new Meteor.Error(400, "Password Request called, but no user was found");
        }

        email = user.emails[0].address;

        let token = Random.secret(),
            when = new Date(),
            tokenRecord = {
                token: token,
                email: email,
                when: when
            },
            emailTokenRecord = _.merge({}, tokenRecord, { address: email });


        Meteor.users.update(userId, {
            $push: { "services.email.verificationTokens": emailTokenRecord }
        });

        Meteor._ensure(user, "services", "email");

        // set to array if doesn't exist
        if (!user.services.email.verificationTokens) {
            user.services.email.verificationTokens = [];
        }

        // here's where we copy the token to the user's email service
        user.services.email.verificationTokens.push(emailTokenRecord);

        let mailer = new Emailer({
            to: email,
            subject: 'Welcome to User Accounts',
            message: 'You have successfully registered as a new User in User Accounts.',
            action: {
                link: Accounts.urls.enrollAccount(token),
                text: 'Verify my email address'
            }
        });

        mailer.send();
        return true;
    },

    /**
     * Send the user an email with a link that when opened allows the user
     * to set a new password, without the old password. See adaptation from
     * [(accounts-password/password_server.js, line 529)]
     * {@link https://github.com/meteor/meteor/blob/master/packages/accounts-password/password_server.js#L529}.
     * 
     * @summary Send an email with a link the user can use to reset their password.
     * @locus Server
     * @param {String} userId The id of the user to send email to.
     */
    'accounts.sendPasswordResetEmail': function(userId) {
        this.unblock();

        let user = Meteor.users.findOne(userId),
            email;

        if (!user) {
            // bad request
            throw new Meteor.Error(400, "Password Request called, but no user was found");
        }

        // for now, we default to the first email found
        email = user.emails[0].address;

        let token = Random.secret(),
            when = new Date(),
            tokenRecord = {
                token: token,
                email: email,
                when: when
            };

        // update mongo with the new token
        Meteor.users.update(userId, {
            $set: {
                "services.password.reset": tokenRecord
            }
        });

        // before passing to template, update user object with new token
        Meteor._ensure(user, 'services', 'password').reset = tokenRecord;

        // use custom emailer class
        let mailer = new Emailer({
            to: email,
            subject: 'Password Reset Request',
            message: 'We have received a request to reset your password. If you haven\'t requested for one, please ignore this email, otherwise please click the button to reset your password.',
            action: {
                link: Accounts.urls.resetPassword(token),
                text: 'Reset Password Now'
            }
        });

        mailer.send();
        return true;
    }

});

/**
 * In the nomral flow of Meteor Accounts, an unverified email is not allowed to pass a log in attempt 
 * We can mimick the same functionality with validateLoginAttempt
 * @param  {Object} attempt The attempt object containing the logged in user if there is one
 * @return {Boolean}        A flag to allow the log in or not
 */
const validateLogin = function(attempt){
    if(attempt.user && attempt.user.emails && !!attempt.user.emails.length){
        let verified = attempt.user.emails[0].verified;

        if(!verified){
            throw new Meteor.Error(500, "Please verify your account with the email we sent you");
        }
        // allowed is a flag set by meteor in case previous hooks didn't allow the the log in atempt
        return verified && attempt.allowed;
    }
}

/**
 * Attach the hook
 */
Meteor.startup(() => {
    Accounts.validateLoginAttempt(validateLogin);
});
