/**================================== DEMO-1：无createMemo的派生体验 **/

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

const displayCount = () => {
  console.log('displayCount call');
  return '当前点击次数: ' + count();
};

setInterval(() => {
  console.log('显示Count: ', displayCount());
}, 2000);
