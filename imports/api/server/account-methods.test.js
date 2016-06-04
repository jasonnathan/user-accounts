/**
 * An example of unit testing on a modular level. These are not Acceptance tests. To run tests here is a different command
 */

/* beautify ignore:start */
import { Meteor } from 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';
import { Accounts } from 'meteor/accounts-base';
import './account-methods.js';
/* beautify ignore:end */

let expect = chai.expect;

describe("User Accounts", function() {
    describe("Forgot Password", function() {
        it("should throw an error if a given email is not a string", function() {
            expect(function() {
                Meteor.call('accounts.checkEmailExists', 12345);
            }).to.throw();
        });
        it("should throw an error if no user was found for a given email address", function() {
            expect(function() {
                Meteor.call('accounts.checkEmailExists', "someRandomEmail@random.com");
            }).to.throw();
        });
    })
});