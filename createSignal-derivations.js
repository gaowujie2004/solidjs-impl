// Derivations: 派生
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

/**================================== DEMO **/

const [firstName, setFirstName] = createSignal('John');
const [lastName, setLastName] = createSignal('Smith');
const fullName = () => {
  console.log('Creating/Updating fullName');
  return `${firstName()} ${lastName()}`;
};

// TODO: 为什么派生函数
createEffect(() => console.log('My name is', fullName()));
createEffect(() => console.log('Your name is not', fullName()));

setFirstName('Jacob');

// Creating/Updating fullName
// My Name is John Smith

// Creating/Updating fullName
// Your name is not John Smith

// Creating/Updating fullName
// My Name is Jacob Smith

// Creating/Updating fullName
// Your name is not Jacob Smith
