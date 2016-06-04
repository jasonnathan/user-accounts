/**
 * This module sends out emails given a Blaze HTML template name and email parameters. It requires
 * a hash with the following keys
 * <code>
 *     {
 *     		to: 'a valid email address',
 *     		from: 'a valid email address. defaults to `User Accounts Support <jjnathanjr+support@gmail.com>`',
 *     		firstName: 'the name of the addressee for the email header',
 *     		message: 'the message body',
 *     		subject: 'the subject header',
 *     		action: {
 *     			text: 'The name of the CTA link',
 *     			link: 'The link that the CTA leads to'
 *     		}
 *     }
 * </code>
 * 
 * 
 * @package Emailer
 * @author  Jason Nathan <jjnathanjr+user-accounts@gmail.com> {@link https://www.jasonnathan.com} 
 */

import { Meteor } from 'meteor/meteor';
import { SSR } from 'meteor/meteorhacks:ssr';
import { Email } from 'meteor/email';
import { _ } from 'lodash';

export default class Emailer {
	/**
	 * Instantiates the class with a params object to send out emails
	 *
	 * <code>
	 *     {
	 *     		to: 'a valid email address',
	 *     		from: 'a valid email address. defaults to `User Accounts Support <jjnathanjr+support@gmail.com>`',
	 *     		firstName: 'the name of the addressee for the email header',
	 *     		subject: 'the subject header',
	 *     		message: 'the message body',
	 *     		action: {
	 *     			text: 'The name of the CTA link',
	 *     			link: 'The link that the CTA leads to'
	 *     		}
	 *     }
	 * </code>
	 * 
	 * @param  {Object} params An object
	 * @return {Object} 	   An instance of itself
	 */
	constructor(params){
		if(typeof params !== 'object'){
			throw new Meteor.Error(400, "Emailer requires an object given to its constructor");
		}

		// email templates are located in the private folder.
		let templatePath = 'emailTemplates/' + (params.template || 'notification') + '.html';

		this.to = params.to;
		this.from = params.from || 'User Accounts Support <jjnathanjr+support@gmail.com>';
		// retrieve relevant properties from the params object
		this.templateData = _.pick(params, ['firstName', 'subject', 'message', 'action']);
		// Assets is a meteor global. It loads files from the /private folder
		this.template = Assets.getText( templatePath );
	}
	/**
	 * This method sends out an email. It uses the Meteor Emails package and it requires an 
	 * env MAIL_URL to be the full smtp string to be set
	 * 
	 * @return {void} Can be extended to catch send errors and send notifications to admins.
	 */
	send(){
		// running in the next event loop i.e. process.tick
		return Meteor.defer( () => {
			// compile the template to inject data into
			SSR.compileTemplate('__placeholder__', this.template);

			// call the Meteor Email package to send the email
			return Email.send({
				from: this.from,
				to: this.to,
        		subject: this.templateData.subject.title,
        		html: SSR.render('_placeholder_', this.templateData)
			});
		})
	}
}