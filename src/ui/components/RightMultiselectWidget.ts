import type { ScriptData } from '../../data';
import type { OptionWidget } from '../ooui';
import { MenuOptionWidget } from '../ooui';
import StringMenuTagMultiselectWidget from './StringMenuTagMultiselectWidget';
import component from './component';
import { menuOptionLabel } from './menuOptions';

interface OptionProps {
	permission: string;
	groups?: string[];
	users?: number;
	matchText?: string;
}

type RightOptionWidget = InstanceType<typeof RightOptionWidget>;

const RightOptionWidget = component(MenuOptionWidget, [], {
	constructor({ permission, groups, users }: OptionProps) {
		this.permission = permission;
		this.groups = groups;
		this.users = users;

		RightOptionWidget.super.call(this, {
			label: menuOptionLabel(permission, this.labelInfo),
			data: permission
		});
	},
	get labelInfo(): string {
		if (!this.groups || this.users === undefined) {
			return '0 local users';
		}

		const usersFormatted = this.users === Infinity ? 'unknown' : this.users.toLocaleString('en');
		const groupList = this.groups.join(', ');

		return `${groupList} (local users: ${usersFormatted})`;
	},
	/**
	 * @override
	 */
	getMatchText(): string | boolean {
		this.matchText ??= `${this.permission} ${this.groups?.join(' ')}`.trim();

		return this.matchText;
	}
});

interface Props {
	localPermissions: ScriptData['localPermissions'];
	allPermissions: ScriptData['allPermissions'];
}

type RightMultiselectWidget = InstanceType<typeof RightMultiselectWidget>;

const RightMultiselectWidget = component(StringMenuTagMultiselectWidget, [], {
	constructor({ localPermissions, allPermissions }: Props) {
		this.localPermissions = localPermissions;
		this.allPermissions = allPermissions;

		const permissions = [...allPermissions].sort((first, second) => {
			const firstIsLocal = localPermissions.has(first);
			const secondIsLocal = localPermissions.has(second);

			if ((firstIsLocal && secondIsLocal) || (!firstIsLocal && !secondIsLocal)) {
				return first.localeCompare(second);
			}

			return firstIsLocal ? -1 : 1;
		});
		const dataItems = permissions.map(permission => ({
			permission,
			groups: localPermissions.get(permission)?.groups,
			users: localPermissions.get(permission)?.users
		}));

		RightMultiselectWidget.super.call(this, {
			allowArbitrary: false,
			// To be transformed by RightOptionWidget
			options: dataItems.map(data => ({ label: '', data: data as unknown as string }))
		});
	},
	/**
	 * @override
	 */
	createMenuOptionWidget(data: string, label?: string, icon?: OO.ui.Icon): OptionWidget {
		if (typeof data === 'string') {
			return RightMultiselectWidget.super.prototype.createMenuOptionWidget.call(this, data, label, icon);
		}

		return new RightOptionWidget(data);
	},
	/**
	 * @override
	 */
	getTagInfo(data: unknown, _label?: string | JQuery): OO.ui.TagMultiselectWidget.TagInfo | undefined {
		if (typeof data !== 'string' || !this.allPermissions.includes(data)) {
			return undefined;
		}

		return { data, label: data };
	}
});

export default RightMultiselectWidget;
