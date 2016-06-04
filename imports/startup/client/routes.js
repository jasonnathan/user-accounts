import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';


//import templates
import '/imports/ui/layouts/default.js';
import '/imports/ui/components/login.js';

/**
 * Setting up password reset trigger here, because the route should automatically go to the form if a token
 * was detected
 */
Session.setDefault('_resetPasswordToken', Accounts._resetPasswordToken);
Session.setDefault('_enrollAccountToken', Accounts._enrollAccountToken);

const publicRoutes = FlowRouter.group({});


publicRoutes.route('/', {
    name: 'home',
    triggersEnter: [function(context, redirect) {
    	// the default template handles redirects if a user is not found
        redirect('/dashboard');
    }]
});

publicRoutes.route('/signIn', {
    name: 'signIn',
    action() {
        BlazeLayout.render("default", { authTemplate: null, pubTemplate: "loginForm" });
    }
});

publicRoutes.route('/forgot-password', {
    name: 'forgetPassword',
    action() {
        BlazeLayout.render("default", { authTemplate: null, pubTemplate: "forgetPasswordForm" });
    }
});

publicRoutes.route('/reset-password/:token', {
    name: 'resetPassword',
    action() {
        BlazeLayout.render("default", { authTemplate: null, pubTemplate: "resetpasswordForm" });
    }
});

publicRoutes.route('/signup/:token', {
    name: 'register',
    action() {
        BlazeLayout.render("default", { authTemplate: null, pubTemplate: "signupForm" });
    }
});

FlowRouter.route('/dashboard', {
    name: 'dashboardHome',
    action() {
        BlazeLayout.render("default", { authTemplate: "welcome", pubTemplate: null });
    }
});

FlowRouter.notFound = {
    action() {
        BlazeLayout.render("centeredLayout", { main: "t404" });
    }
}
