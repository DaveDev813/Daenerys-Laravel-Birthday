import GlobalSplash from 'components/GlobalSplash.vue'
import { createVNode, render } from 'vue'
import { boot } from 'quasar/wrappers'

let vm

export default boot(({ app }) => {
  const el = document.createElement('div')
  document.body.appendChild(el)

  const vnode = createVNode(GlobalSplash)
  render(vnode, el)

  vm = vnode.component?.exposed

  // Intercept $q.loading and replace with custom splash
  const $q = app.config.globalProperties.$q

  if ($q?.loading) {
    const originalShow = $q.loading.show
    const originalHide = $q.loading.hide

    $q.loading.show = (...args) => {
      showSplash()
    }

    $q.loading.hide = (...args) => {
      hideSplash()
    }
  }
})

export function showSplash() {
  vm?.show()
}

export function hideSplash() {
  vm?.hide()
}
