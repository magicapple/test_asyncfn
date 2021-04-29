let index = 0;

// 异步函数
const asyncFn = (callback) => {
  var currentIndex = index++;
  setTimeout(() => {
    callback(currentIndex);
    console.log(currentIndex);
  }, 1000 + 100 * currentIndex);
};

// 异步函数转 promise
const makePromise = function (asyncFn) {
  return new Promise((resolve) => {
    asyncFn((res) => {
      resolve(res);
    });
  });
};

// 1 异步函数队列串行执行
const syncQueue = async (asyncFnList) => {
  console.time();
  for (const asyncFn of asyncFnList) {
    await makePromise(asyncFn);
  }
  console.timeEnd();
};

// syncQueue([asyncFn, asyncFn, asyncFn, asyncFn]);

// 2 异步函数队列并行执行
const concurrentQueue = async (asyncFunList, callback) => {
  console.time();
  await Promise.all(asyncFunList.map((asyncFn) => makePromise(asyncFn)));
  callback();
  console.timeEnd();
};

// concurrentQueue([asyncFn, asyncFn, asyncFn, asyncFn], function () {
//   console.log("end");
// });

// 2.1 函数函数并行执行，并且在每个函数执行后调用callback
const concurrentQueue1 = async (asyncFunList, callback, callbackEnd) => {
  console.time();
  await Promise.all(
    asyncFunList.map((asyncFn) =>
      makePromise(asyncFn).then((res) => {
        callback(res);
      })
    )
  );
  callbackEnd();
  console.timeEnd();
};

// concurrentQueue1([asyncFn, asyncFn, asyncFn, asyncFn], function(res) {
//   console.log('callback===>', res)
// }, function () {
//   console.log("end");
// });

// 2.2 前 n 个异步执行函数执行完掉用callback
const concurrentQueue2 = async (asyncFunList, callback, callbackEnd, n) => {
  let index = 0;
  console.time();
  await Promise.all(
    asyncFunList.map((asyncFn) =>
      makePromise(asyncFn).then((res) => {
        if (index < n) {
          callback(res);
          index++;
        }
      })
    )
  );
  callbackEnd();
  console.timeEnd();
};

// concurrentQueue2([asyncFn, asyncFn, asyncFn, asyncFn], function(res) {
//   console.log('callback===>', res)
// }, function () {
//   console.log("end");
// }, 2);

// 3 异步队列支持最大并发执行，

const concurrentQueue3 = async (asyncFunList, threadNumber) => {
  while (threadNumber > 0 && asyncFunList.length > 0) {
    threadNumber--;
    const asyncFn = asyncFunList.shift();
    makePromise(asyncFn).then((res) => {
      concurrentQueue3(asyncFunList, 1);
    });
  }
};

concurrentQueue3([asyncFn, asyncFn, asyncFn, asyncFn, asyncFn], 4);

// 这个不对
// const concurrentQueue3 = async (asyncFunList, callback, threadNumber) => {
//   console.time();
//   while (asyncFunList.length > 0) {
//     const threadList = asyncFunList.splice(0, threadNumber);
//     await Promise.all(threadList.map((asyncFn) => makePromise(asyncFn)));
//     console.log("----------");
//   }
//   callback();
//   console.timeEnd();
// };

// concurrentQueue3(
//   [asyncFn, asyncFn, asyncFn, asyncFn, asyncFn],
//   function () {
//     console.log("end");
//   },
//   2
// );
