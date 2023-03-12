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
  // TODO: 异步使用 getter 无法追踪，因为getter调用进行依赖收集，是同步进行的。
  // TODO: 当effectCallback调用时，因为setTimeout是异步的，所有等effectCallback执行完后，才会执行定时器callback。
  // TODO: 当定时器callback执行时，currentSubscriber等于null。具体看 createEffect内部代码
  setTimeout(() => {
    console.log('--响应式执行1，count:', getCount());
    console.log('--响应式执行2，count:', getCount());

    console.log('\n');
  }, 1000);
});

setTimeout(() => {
  setCount(100);
}, 2000);
