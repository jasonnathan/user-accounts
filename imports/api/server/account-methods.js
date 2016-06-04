import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { _ } from 'lodash';
import Emailer from '/imports/startup/server/email.js';


Meteor.methods({

    /**
     * A simple method that finds a user by his email or throws an error 
     * if one is not found
     * 
     * @param  {String} email A valid email address
     * @return {String}       The user id of the found user
     */
    'accounts.findByEmail': function(email) {
        check(email, String);
        let user = Accounts.findUserByEmail(email);

        if (!user) {
            throw new Meteor.Error(403, "No record found for that email address")
        }

        return user._id;
    },

    /**
     * Send the user an email informing them that their account was created, with
     * a link that when opened both marks their email as verified and forces them
     * to choose their password.  Also adding the token for email verification because 
     * it makes sense to do both in this case.
     *
     * See adaptation from [(accounts-password/password_server.js, line 595)]
     * {@link https://github.com/meteor/meteor/blob/master/packages/accounts-password/password_server.js#L595}.
     *
     * @summary Send an email with a link the user can use to set their initial password.
     * @locus Server
     * @param {String} userId The id of the user to send email to.
     */
    'accounts.sendInviteEmail': function(userId) {
        check(userId, String);
        /**
         * @link https://meteorhacks.com/understanding-meteor-wait-time-and-this-unblock/
         */
        this.unblock();

        let user = Meteor.users.fincOne(userId),
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
                totken: token,
                email: email,
                when: when
            },
            emailTokenRecord = _.merge({}, tokenRecord, { address: email });


        Meteor.users.update(userId, {
            $set: { "services.password.reset": tokenRecord },
            $push: { "services.email.verificationTokens": emailTokenRecord }
        });

        Meteor._ensure(user, "services", "email");
        Meteor._ensure(user, "services", "password").reset = tokenRecord;


        // set to array if doesn't exist
        if (!user.services.email.verificationTokens) {
            user.services.email.verificationTokens = [];
        }

        // here's where we copy the token to the user's email service
        user.services.email.verificationTokens.push(emailTokenRecord);

        let mailer = new Emailer({
            to: email,
            firstName: user.profile.firstName,
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
            firstName: user.profile.firstName,
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
