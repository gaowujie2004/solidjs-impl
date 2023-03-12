/**
 * 验证：把signal的订阅者全部清空掉，那signal setter时，还能找到对应的effectCallback吗？
 * 可以。因为清空是在 effectCallback 执行前一刻执行的，清空后又接着调用 effectCallback，调用getter，更新signal的订阅者列表。
 */

const { createEffect, createSignal } = require('.');

const [show, setShow] = createSignal(true);
const [title, setTitle] = createSignal('啥也不是');

createEffect(function effect1() {
  console.log('effect callback 1');
  if (show()) {
    console.log('Title：', title());
  } else {
    console.log('Title: ', 'kong');
  }

  console.log('\n');
});

setTimeout(() => {
  setShow(false);
}, 1000);

setTimeout(() => {
  setShow(true);
}, 2000);
