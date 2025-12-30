function onBeforeUnload(event: BeforeUnloadEvent): void {
	event.preventDefault();
}

export default {
	attach(): void {
		window.addEventListener('beforeunload', onBeforeUnload);
	},
	unattach(): void {
		window.removeEventListener('beforeunload', onBeforeUnload);
	}
};
