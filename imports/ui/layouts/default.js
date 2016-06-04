import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import './default.html';

/**
 * Simple method that checks if current route is withing allowed routes
 * and redirects if not
 * @param  {Array}  routes   An array of allowed routes
 * @param  {String} redirect The route to redirect to
 * @return {void}
 */
const handleRedirect = (routes, redirect) => {
    let currentRoute = FlowRouter.getRouteName();

    if (routes.indexOf(currentRoute) > -1) {

        Meteor.defer(() => {
            FlowRouter.go(redirect);
        })
        return true;
    }
};

/**
 * The only listener on create is if there are tokens present. Redirects to the correct page
 * if one is found.
 */
Template.default.onCreated(function() {
    this.autorun(() => {
        let _rt = Session.get('_resetPasswordToken'),
            _et = Session.get('_enrollAccountToken');

        Session.set('_resetPasswordToken', null);
        Session.set('_enrollAccountToken', null);

        if (_rt && !Meteor.userId()) {
            FlowRouter.go('resetPassword', { token: _rt });
            return true;
        }

        if (_et && !Meteor.userId()) {
            FlowRouter.go('register', { token: _et });
            return true;
        }
    });
});

Template.default.helpers({
	/**
	 * display loading indicator if user is logging in	 
	 */
    loggingIn() {
        return Meteor.loggingIn();
    },

    /**
     * Checks if current route is a public route and redirects the user to the dashboard
     */
    redirectAuthenticated() {
        return handleRedirect([
            'signIn',
            'register',
            'forgetPassword',
            'resetPassword'
        ], 'dashboardHome');
    },

    /**
     * Checks if current route is authenticated route and redirects user to the sign in page
     */
    redirectPublic() {
        return handleRedirect([
            'dashboardHome'
        ], 'signIn');

    }
});