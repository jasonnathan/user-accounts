import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './dashboard.html';

Template.welcome.events({
    'click #logoutBtn': function(e, tmpl) {
        e.preventDefault();
        Meteor.logout();
    }
});