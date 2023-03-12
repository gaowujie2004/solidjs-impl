/**================================== 目的：验证createEffect嵌套 **/

const { createEffect, createSignal } = require('.');

const [show, setShow] = createSignal(true);
const [title, setTitle] = createSignal('啥也不是');

createEffect(() => {
  console.log('effect callback');
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
  setTitle('第一次setTitle()');
}, 2000);

setTimeout(() => {
  setShow(true);
}, 3000);

setTimeout(() => {
  setShow('第二次setTitle()');
}, 4000);

/**================================== 执行结果 **/
// effect callback
// Title： 啥也不是

// effect callback
// Title:  kong

// effect callback
// Title:  第一次setTitle()

// effect callback
// Title：第二次setTitle()
