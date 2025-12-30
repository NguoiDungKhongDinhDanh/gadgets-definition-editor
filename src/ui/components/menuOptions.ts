import constants from '../../constants';
import { HtmlSnippet } from '../ooui';

export function menuOptionLabel(name: string, info: string | undefined): HtmlSnippet {
	const $wrapper = $('<span>').text(name);

	if (info !== undefined) {
		const $info = $('<span>').addClass(constants.IDENTIFIERS.GRAYED_OUT).text(info);
		$wrapper.append(' ', $info);
	}

	return new HtmlSnippet($wrapper.prop('outerHTML') as string);
}
