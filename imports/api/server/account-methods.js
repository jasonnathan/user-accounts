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
    }
});