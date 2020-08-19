export default async({store}) => {
	if (!Object.keys(store.state.post).length) await store.dispatch('getAllPosts');
}