import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './signup.html';

Template.signupForm.onCreated(function() {
    this.isProcessing = new ReactiveVar();
    this.errorMessage = new ReactiveVar();
    // this should be a Session variable so the registration form isn't displayed after the first successful submission
    this.isSuccess = new ReactiveVar();
    this.verifyForm = (params, cb) => {
        // 'email', 'password', 'confirmPassword', 'secretWord'

        if (!params.email || !params.email.trim())
            return cb("A valid email is required");

        // this is not an ideal way to validate fields, as a server side method is called whether or not
        // the email field was changed. But is okay to do because this method is only fired on submit
        Meteor.call('accounts.findByEmail', params.email, (err, res) => {
            if (err) {
                return cb(err)
            }

            if (!params.password || !params.password.trim() || !params.confirmPassword || !params.confirmPassword.trim()) {
                return cb(new Meteor.Error(400, "Your passwords cannot be empty"));
            }

            if (params.password !== params.confirmPassword) {
                return cb(new Meteor.Error(400, "Your passwords do not match, please try again"));
            }

            return cb(null, true);
        });
    }
});

Template.signupForm.helpers({
    isProcessing() {
        return Template.instance().isProcessing.get(); },
    isSuccess() {
        return Template.instance().isSuccess.get(); },
    errorMessage() {
        return Template.instance().errorMessage.get(); }
});

Template.signupForm.events({
    'submit #signupForm': function(event, tmpl) {
        event.preventDefault();
        let params = {
            email: $('#registerEmail').val(),
            password: $('#newPassword').val(),
            confirmPassword: $('#confirmNewPassword').val(),
        };

        tmpl.isProcessing.set(true);
        tmpl.errorMessage.set(null);

        tmpl.verifyForm(params, (err, res) => {
            if (err) {
                tmpl.isProcessing.set(false);
                return tmpl.errorMessage.set(err.reason);
            }

            // Meteor hashes the password with SHA256 before it is sent over the wire,
            // but HTTPS is still a better way to go.
            params.password = Accounts._hashPassword(params.password);

            // we don't need the confirmPassword field any more
            delete params.confirmPassword;

            /**
             * Accounts.createUser does exactly the same thing (and more). Creating a custom method
             * here as an example of how this can be done without having to use Account hooks etc.
             * The server method in turn sends the verification email, you can also add other custom
             * functionality to it.
             * 
             * @param  {Method} 'accounts.createUser' A server side method wired to create an account
             * @param  {Object}  params                An object with an email and hashed password to use
             * @param  {Error}   regErr                An error object if it was returned
             * @param  {Boolean} regRes                True, if created succesfully.
             */
            Meteor.call('accounts.createUser', params, (regErr, regRes) => {
                tmpl.isProcessing.set(false);
                return !!regErr ? tmpl.errorMessage.set(regErr.reason) : tmpl.isSuccess.set(true);
            });
        });
    }
})
