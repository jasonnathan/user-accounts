/**
 * Create a default user if one doesn't exist
 * @package Fixtures (Startup)
 * @author Jason Nathan <jjnathanjr+user-accounts@gmail.com>  {@link https://www.jasonnathan.com}
 */
import { Meteor } from 'meteor/meteor';

Meteor.startup(function() {
    /**
     * Checks if the user collection is empty and creates a default user if it is
     * @return {void}
     */
    if (Meteor.users.find().count() === 0) {
        let superAdmin = Accounts.createUser({
            email: process.env.DEFAULT_EMAIL,
            password: process.env.DEFAULT_PASS,
            profile: {
                firstName: process.env.DEFAULT_FNAME,
                lastName: process.env.DEFAULT_LNAME
            }
        });

        Meteor.users.update({ _id: superAdmin, 'emails.address': process.env.DEFAULT_EMAIL }, { $set: { 'emails.$.verified': true } });
    }
})
