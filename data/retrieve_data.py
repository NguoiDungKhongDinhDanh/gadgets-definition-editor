# /// script
# requires-python = ">=3.14"
# dependencies = [
#     "requests",
# ]
# ///

# pyright: strict

from collections.abc import Generator
from pathlib import Path
import sys
from typing import Any

import requests


DATA_DIRECTORY = Path(__file__).parent
HEADERS = {'User-Agent': 'NDKDDBot'}


def get_site_data() -> Generator[dict[str, Any]]:
	url = 'https://meta.wikimedia.org/w/api.php?action=sitematrix&format=json&formatversion=2'
	response = requests.get(url, headers=HEADERS)
	content = response.json()

	for key, value in content['sitematrix'].items():
		if key == 'count':
			continue

		if key == 'specials':
			yield from value
			continue

		yield from value['site']


def main(dir_name: str) -> None:
	dir = DATA_DIRECTORY / dir_name
	dir.mkdir(exist_ok=True)

	for site in get_site_data():
		if site.get('closed'):
			continue

		site_url = site['url']
		domain = site_url.removeprefix('https://')
		raw_file_url = f'{site_url}/wiki/MediaWiki:Gadgets-definition?action=raw'

		response = requests.get(raw_file_url, headers=HEADERS)

		if response.status_code != 200:
			print(f'{domain}: {response.status_code}')
			continue

		text = response.text

		if text.lower().startswith('<!doctype'):
			print(f'{domain}: Unaccessible')
			continue

		file = dir / f'{domain}.wikitext'
		file.write_text(text, encoding='utf-8')

		print(f'{domain}: Retrieved')


if __name__ == '__main__':
	main(sys.argv[1])
