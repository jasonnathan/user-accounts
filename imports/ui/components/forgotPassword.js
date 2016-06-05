import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './forgotPassword.html';

/**
 * FORGOT PASSWORD FORM
 */
Template.forgetPasswordForm.onCreated(function() {
    // used to hold the email address
    this.emailField = new ReactiveVar(null);

    // flag to update UI if processing
    this.isProcessing = new ReactiveVar(false);

    // flag to display success message
    this.isSuccess = new ReactiveVar(false);

    // flag to display error message
    this.isError = new ReactiveVar(false);

    // flag to trigger email
    this.foundUser = new ReactiveVar(null);

    // run a tracker to detect a found user to invoke the forgot password methods accordingly
    this.autorun((comp) => {
        let u = this.foundUser.get();

        // re-run if no user is found
        if (!u)
            return;

        // stop the computation
        comp.stop();

        // call the forgotPassword function to send an email to the user
        Meteor.call('accounts.sendPasswordResetEmail', u, (err, res) => {
            this.isProcessing.set(false);
            if (err) {
                return this.isError.set(err.reason);
            }
            if (!!res) {
                this.isSuccess.set(true);
            }
        })
    });
});
Template.forgetPasswordForm.helpers({
    isProcessing() {
        return Template.instance().isProcessing.get();
    },
    isError() {
        return Template.instance().isError.get();
    },
    isSuccess() {
        return Template.instance().isSuccess.get();
    }
})

Template.forgetPasswordForm.events({
    // submission finds a user by email which in turn triggers the autorun to submit a password reset email
    'submit #forgetPasswordForm': function(e, tmpl) {
        e.preventDefault();
        let email = tmpl.$("#forgotEmail").val();

        // set the isProcessing flag to true
        tmpl.isProcessing.set(true);

        //reset errors
        tmpl.isError.set(null);

        // check for an existing user and set the reactive var accordingly
        Meteor.call("accounts.checkEmailExists", email.trim(), function(err, res) {

            if (err) {
                tmpl.isProcessing.set(false);
                // errors get displayed is there are any
                return tmpl.isError.set(err.reason);
            }

            // we found a user. this triggers the autorun above
            return !!res && tmpl.foundUser.set(res);
        });
    }
});
/******************************************************************************/