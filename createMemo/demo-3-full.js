/**================================== DEMO-3：综合体验 **/

let globalCurrentSubscriber = null;

function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  const getter = () => {
    if (globalCurrentSubscriber) {
      subscribers.add(globalCurrentSubscriber);
    }
    return value;
  };

  const setter = (newValue) => {
    value = newValue;
    subscribers.forEach((effectFn) => effectFn());
  };

  return [getter, setter];
}

function createEffect(effectCallback) {
  globalCurrentSubscriber = effectCallback;
  effectCallback();
  globalCurrentSubscriber = null;
}

function createMemo(fn) {
  const [getMemo, setMemo] = createSignal();
  createEffect(function memoEffect() {
    setMemo(fn());
  });
  return getMemo;
}

/**================================== Start **/
const [count, setCount] = createSignal(0);

// 创建的 getter
const displayCount = createMemo(() => {
  console.log('displayCount Memo callback');
  return '当前点击次数-' + count() + '次';
});

createEffect(() => {
  console.log('effect callback: ', displayCount());
  // 此createEffect执行期间，调用effectCallback期间：displayCount 是 createMemo() 返回的 getter
  // 所以此effectCallback，是createMemo中signal的订阅者。
});

setTimeout(() => {
  setCount(10);
}, 1000);

setTimeout(() => {
  setCount(20);
}, 1500);
