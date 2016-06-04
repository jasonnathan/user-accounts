import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './signup.html';

Template.signupForm.onCreated(function() {
    this.isProcessing = new ReactiveVar();
    this.errorMessage = new ReactiveVar();
    this.isSuccess = new ReactiveVar();
    this.verifyForm = (params, cb) => {
        // 'email', 'password', 'confirmPassword', 'secretWord'

        if (!params.email || !params.email.trim())
            return cb("A valid email is required");

        Meteor.call('accounts.findByEmail', params.email, (err, res) => {
            if (err) {
                return cb(err)
            }

            if(!params.password || !params.password.trim() || !params.confirmPassword || !params.confirmPassword.trim()){
            	return cb(new Meteor.Error(400, "Your passwords cannot be empty"));
            }

            if(params.password !== params.confirmPassword){
            	return cb(new Meteor.Error(400, "Your passwords do not match, please try again"));
            }

            if(!params.secretWord || !params.secretWord.trim()){
            	return cb(new Meteor.Error(400, "Your secret word cannot be empty"));
            }

            return cb(null, true);

        });
    }
});

Template.signupForm.helpers({
    isProcessing() {
        return Template.instance().isProcessing.get();
    },
    errorMessage() {
        let em = Template.instance().errorMessage.get();

        return _.isString(em) ? em : null;
    },
    isSuccess(){
    	return Template.instance().isSuccess.get();
    }
});

Template.signupForm.events({
	'submit #signupForm': function(event, tmpl){
		event.preventDefault();
		let params = {
			email: $('#registerEmail').val(),
			password: $('#newPassword').val(),
			confirmPassword: $('#confirmNewPassword').val(),
			secretWord: $('#secretWord').val()
		};

		tmpl.isProcessing.set(true);
		tmpl.errorMessage.set(null);

		tmpl.verifyForm(params, (err, res) => {
			if(err){
				tmpl.isProcessing.set(false);
				return tmpl.errorMessage.set(err.reason);
			}

			delete params.confirmPassword;

			Meteor.call('accounts.createUser', params, function(regErr, regRes){
				if(regErr){
					tmpl.isProcessing.set(false);
					return tmpl.errorMessage.set(regErr.reason);
				}

				tmpl.isProcessing.set(false);
				return tmpl.isSuccess.set(true);
			});
		});
	}
})
