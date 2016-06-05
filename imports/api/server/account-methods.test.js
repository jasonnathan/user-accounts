/**
 * Please ensure the application is run at least once so all fixtures get to run at least once. 
 * There is no stubbing here but you should add more tests as you continue to customise the package
 */

/* beautify ignore:start */
import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { Accounts } from 'meteor/accounts-base';
import './account-methods.js';
/* beautify ignore:end */

let expect = chai.expect;

describe("User Accounts", function() {
    describe("Unique User", function() {
        it("should throw an error if a given email is not a string", function() {
            expect(function() {
                Meteor.call('accounts.findByEmail', 12345);
            }).to.throw();           
        });
        it("should throw an error if a user was found for a given email address", function() {
            expect(function() {
                Meteor.call('accounts.findByEmail', process.env.DEFAULT_EMAIL);
            }).to.throw();
        });
    });
});