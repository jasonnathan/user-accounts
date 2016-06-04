import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './dashboard.html';

Template.welcome.onCreated(function() {
    this.secret = new ReactiveVar();
});

Template.welcome.onRendered(function() {
    Meteor.call('accounts.getSecret', (err, res) => {
        if (err) {
            throw err;
        }

        console.log(err, res)

        this.secret.set(res);
    });
});

Template.welcome.helpers({
	getSecret(){
		return Template.instance().secret.get();
	}
});

Template.welcome.events({
    'click #logoutBtn': function(e, tmpl) {
        e.preventDefault();
        Meteor.logout();
    }
})
