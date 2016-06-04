import { Accounts } from 'meteor/accounts-base';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './login.html';

/**
 * LOGIN FORM
 */
Template.loginForm.onCreated(function() {
    this.isProcessing = new ReactiveVar(false); 
    this.errorMessage = new ReactiveVar(null)   
});

Template.loginForm.helpers({
    isProcessing() {
        return Template.instance().isProcessing.get();
    },
    errorMessage() {
        let em = Template.instance().errorMessage.get();

        return _.isString(em) ? em : null;
    }
});

Template.loginForm.events({
    'submit #loginForm': function(e, tmpl) {
        e.preventDefault();
        let formInputs = tmpl.$('#loginForm input'),
            hasErrors = false,
            email, password;

        formInputs.each(function() {
            let element = $(this),
                name = element.attr('name');

            if (element.hasClass('invalid')) {
                hasErrors = true;
                return;
            }

            name === 'email' && (email = element.val().trim());
            name === 'password' && (password = element.val());

        });

        if (hasErrors) {
            return false;
        }
        tmpl.isProcessing.set(true);        
        // deferring to allow animation
        Meteor.setTimeout(() => {
            Meteor.loginWithPassword(email, password, (err) => {
                tmpl.isProcessing.set(false);
                if (err) {
                    return tmpl.errorMessage.set(err.reason);
                }
                tmpl.errorMessage.set(false);

                FlowRouter.go('dashboardHome');
            });
        }, 500);
    }
});