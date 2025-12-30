import StringMenuTagMultiselectWidget from './StringMenuTagMultiselectWidget';
import component from './component';

/**
 * @see {@link https://www.mediawiki.org/wiki/Manual:Parameters_to_index.php#Actions mw:Manual:Parameters to index.php &sect; Actions}
 */
const KNOWN_ACTIONS: readonly string[] = [
	'credits',
	'delete',
	'edit',
	'editredlink',
	'history',
	'historysubmit',
	'info',
	'markpatrolled',
	'protect',
	'purge',
	'raw',
	'render',
	'revert',
	'revisiondelete',
	'rollback',
	'submit',
	'unprotect',
	'unwatch',
	'view',
	'watch'
];

type ActionMultiselectWidget = InstanceType<typeof ActionMultiselectWidget>;

const ActionMultiselectWidget = component(StringMenuTagMultiselectWidget, [], {
	constructor() {
		const options = KNOWN_ACTIONS.map(action => ({ label: action, data: action }));

		ActionMultiselectWidget.super.call(this, {
			// Update the list above, don't edit this.
			allowArbitrary: false,
			options
		});
	}
});

export default ActionMultiselectWidget;
