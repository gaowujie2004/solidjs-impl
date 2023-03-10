let globalCurrentSubscriber = null;

/**
 * @zh getter调用时，获取订阅制effectCallback
 */
function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  // 再访问时追踪
  const getter = () => {
    if (globalCurrentSubscriber) {
      subscribers.add(currentSubscriber);
    }
    return value;
  };

  const setter = (newValue) => {
    value = newValue;
    // 触发当前signal的订阅列表函数
    subscribers.forEach((effectFn) => effectFn());
  };

  return [getter, setter];
}

/**
 * @zh 被追踪的东西，当 signal 改变时，effectCallback 将重新执行
 */
function createEffect(effectCallback) {
  globalCurrentSubscriber = effectCallback;
  effectCallback();
  globalCurrentSubscriber = null;
}

/**
 * @zh fn: 包含signal getter函数调用
 */
function createMemo(fn) {
  const [getMemo, setMemo] = createSignal();
  createEffect(function memoEffect() {
    setMemo(fn());
  });

  return getMemo;
}

// 灵感
/**
 * 1. createEffect函数，从调用到结束这个范围内，effectCallback内部调用getter时，此时当前的effectCallback一直在全局变量：
 * globalCurrentSubscriber中保存着，所以getter可以最终到，并加入到当前signal的订阅列表中。
 *
 * 但有一些问题：
 * 1. effectCallback，连在调用多次相同的getter，所以订阅列表要有去重功能，即一个signal的订阅函数不能重复。
 * TODO: 2. createEffect 嵌套问题
 *
 */
