let currentSubscriber = null;

function createSignal(initValue) {
  let value = initValue;
  const subscribers = new Set();

  const getter = () => {
    if (currentSubscriber) {
      subscribers.add(currentSubscriber);
    }
    return value;
  };

  const setter = (newValue) => {
    value = newValue;
    subscribers.forEach((subscriberFn) => subscriberFn());
  };

  return [getter, setter];
}

function createEffect(effectCallbackFn) {
  currentSubscriber = effectCallbackFn;
  effectCallbackFn();

  currentSubscriber = null; // TODO: 因为这句话，所以 createEffect 内部使用 getter 应该是同步的方式，如果异步，这里就给清空了。
}

/**================================== TEST **/
const [getCount, setCount] = createSignal(0);

createEffect(() => {
  // TODO: 异步使用 getter 无法追踪
  setTimeout(() => {
    console.log('--响应式执行1，count:', getCount());
    console.log('--响应式执行2，count:', getCount());

    console.log('\n');
  }, 1000);
});

setTimeout(() => {
  setCount(100);
}, 2000);
