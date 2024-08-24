import VueGtag from 'vue-gtag';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  nuxtApp.vueApp.use(
    VueGtag,
    {
      config: { id: 'G-0RZ4CYP8DB' },
    },
    router,
  );
});
