/**
 * 使用数组，而不是globalCurrentSubscribe保存单一的effectCallback，是因为：
 * createEffect 是可以嵌套的，这就是函数的调用栈，故使用JS数组，模拟函数的调用栈。
 * 若使用globalCurrentSubscribe嵌套调用createEffect时，父的effectCallback将会被覆盖。
 *
 * 列如如下代码：
 * createEffect(function effect1() {
 *      createEffect(function effect2() {
 *      })
 * })
 */
const context = [];

function subscribe(running, subscriptions) {
  subscriptions.add(running);
  running.dependencies.add(subscriptions);
}

function createSignal(value) {
  const subscriptions = new Set();

  const read = () => {
    const running = context[context.length - 1];
    if (running) subscribe(running, subscriptions);
    return value;
  };

  const write = (nextValue) => {
    value = nextValue;

    for (const sub of [...subscriptions]) {
      sub.execute();
    }
  };
  return [read, write];
}

/**
 * 为什么要清除掉signal的订阅者列表呢？有一下几个原因：
 
 * 1、动态收集依赖signal的effect —— dynamic-collect-effect
 在线代码：https://playground.solidjs.com/anonymous/ffa0d4dd-728c-4e06-a0de-5f3e7a52b45b
 当show为false时，effectCallback将再次执行，网页标题变为''; 然后再调用handleChangeTitle时，effectCallback不执行。
 show() = false， title() 已经在effectCallback不会再执行了，所以setTitle()不应该触发effectCallback
 
 * 2、？？？不确定。当前组件销毁后，为了防止内存泄漏，需要把每个effectCallback（跟踪函数）从signal订阅者列表中删除掉。
 */

/**
 * 把signal的订阅者全部清空掉，那signal setter时，还能找到对应的effectCallback吗？
 * 1、具体样例代码：dynamic-collect-effect-2.js
 * 当show=false，重新调用effect1函数，此时的cleanup只会清除，show-signal的订阅者列表。是这样的，先删除依赖，然后调用effectCallback时，再动态收集依赖。
 * 原理是这样的：先清空之前signal的订阅制列表，然后再运行effectCallback，运行期间会调用getter，则再次动态进行依赖收集。加入到signal对应的订阅者列表中。
 *
 */
function cleanup(running) {
  var res;
  for (const dep of running.dependencies) {
    res = dep.delete(running);
  }
  running.dependencies.clear();
  /**
   * 只执行running.dependencies.clear();不就行了吗？
   * 为什么还要循环执行dep.delete(running); ？
   *    clear(); 虽然可以删除。但是createSignal函数内部的subscriptions，仍然保持着对running的引用
   *    所以必须找到createSignal函数内部的subscriptions，然后删除掉signal对应的subscriptions成员running
   */
}

function createEffect(fn) {
  const execute = () => {
    // 清除依赖
    cleanup(running);
    context.push(running);
    try {
      fn(); // 再动态收集依赖，最后signal中还是有订阅列表
    } finally {
      context.pop();
    }
  };

  const running = {
    execute,
    // 存储当前effectCallback对应signal getter的订阅者列表，即dependencies列表成员是一个列表
    // 若effectCallback内部有多个signal getter调用，那么改字段列表成员将有多个signal的订阅列表
    dependencies: new Set(),
  };

  execute();
}

module.exports = {
  createEffect,
  createSignal,
};
