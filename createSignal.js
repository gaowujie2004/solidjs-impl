let currentSubscriber = null; // effectCallbackFn

function createSignal(initValue) {
  let value = initValue;
  const subscribers = new Set(); // createEffect callback，可能多次调用 getter，比如DEMO-1

  const getter = () => {
    if (currentSubscriber) {
      subscribers.add(currentSubscriber);
    }
    return value;
  };

  const setter = (newValue) => {
    value = newValue;
    // 响应式：触发订阅该值的订阅者（createEffect callback 或 派生signal）
    subscribers.forEach((subscriberFn) => subscriberFn());
  };

  return [getter, setter];
}

function createEffect(effectCallbackFn) {
  currentSubscriber = effectCallbackFn;
  effectCallbackFn();

  currentSubscriber = null; // TODO: 为什么，好理解
}

/**================================== DEMO-1 **/
() => {
  const [getCount, setCount] = createSignal(0);
  createEffect(() => {
    console.log('--响应式执行1，count:', getCount());
    // createEffect 函数执行时，即把 effectCallback 赋值给 currentSubscriber 全局变量。
    //    createEffect 函数执行时，紧接着调用 effectCallback，而 effectCallback，内部调用了 getter，即 getCount。
    //    所以，currentSubscriber 的值是：当前 effectCallback，并且是 effectCallback 内部 getter 的订阅着函数「即响应式函数」
    console.log('--响应式执行2，count:', getCount());

    console.log('\n');
  });

  setTimeout(() => {
    setCount(100);
  }, 2000);
};

/**================================== DEMO-2：currentSubscriber!==null **/
(() => {
  const [getCount, setCount] = createSignal(0);
  createEffect(() => {
    console.log('--响应式执行1，count:', getCount());
    // createEffect 函数执行时，即把 effectCallback 赋值给 currentSubscriber 全局变量。
    //    createEffect 函数执行时，紧接着调用 effectCallback，而 effectCallback，内部调用了 getter，即 getCount。
    //    所以，currentSubscriber 的值是：当前 effectCallback，并且是 effectCallback 内部 getter 的订阅着函数「即响应式函数」
    console.log('--响应式执行2，count:', getCount());

    console.log('\n');
  });

  const [getCount2, setCount2] = createSignal(88);
  console.log('响应式函数哈哈哈: ', getCount2());

  setTimeout(() => {
    setCount2(99);
  }, 1000);
})();
