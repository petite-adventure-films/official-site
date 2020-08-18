import createPersistedState from 'vuex-persistedstate'

export default ({store}) => {
	window.onNuxtReady(() => {
		createPersistedState({
			paths: ['pafCart', 'pafCartCount'] // 保持したいデータのみ登録
		})(store)
	})
}