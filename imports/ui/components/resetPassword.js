import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './resetPassword.html';

Template.resetpasswordForm.onCreated(function() {
    this.isProcessing = new ReactiveVar();
    this.errorMessage = new ReactiveVar();
    // this should be a Session variable so the registration form isn't displayed after the first successful submission
    this.isSuccess = new ReactiveVar();
    this.verifyForm = (params) => {

        if (!params.password || !params.password.trim() || !params.confirmPassword || !params.confirmPassword.trim()) {
            throw new Meteor.Error(400, "Your passwords cannot be empty")
        }

        if (params.password !== params.confirmPassword) {
            throw new Meteor.Error(400, "Your passwords do not match, please try again")
        }

        return true;
    }
});


Template.resetpasswordForm.helpers({
    isProcessing() {
        return Template.instance().isProcessing.get(); },
    isSuccess() {
        return Template.instance().isSuccess.get(); },
    errorMessage() {
        return Template.instance().errorMessage.get(); }
});

Template.resetpasswordForm.events({
    'submit #resetpasswordForm': function(event, tmpl) {
        event.preventDefault();
        let params = {
            password: $('#resetPassword').val(),
            confirmPassword: $('#confirmResetPassword').val(),
        };

        tmpl.isProcessing.set(true);
        tmpl.errorMessage.set(null);

        try{
        	let res = tmpl.verifyForm(params);

	        Accounts.resetPassword(FlowRouter.getParam('token'), params.password, (err) => {
	            if (err) {
	            	tmpl.isProcessing.set(false);
	                return tmpl.errorMessage.set(err.reason);
	            }
	            FlowRouter.go('dashboardHome');
	        });

        } catch(err){
            tmpl.isProcessing.set(false);
            return tmpl.errorMessage.set(err.reason);
        }
    }
});