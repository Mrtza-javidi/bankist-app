'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 30000, -650.1234, -130.34, 70.345, 1300.3],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2024-01-18T14:18:46.235Z',
    '2024-05-19T16:33:06.386Z',
    '2024-05-20T14:43:26.374Z',
    '2024-05-21T21:49:59.371Z',
    '2024-05-22T01:23:59.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

let currentUsername;
let currentPin;
let loanAmount = 0;
let sortedMovements = undefined;
let timer;

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelSumLoan = document.querySelector('.summary__value--loan');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// make username for all users imediatelly
(function usernameMaker() {
  for (const account of accounts) {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name.slice(0, 1))
      .join('');
  }
})();

/* --------------------- login section --------------------- */
btnLogin.addEventListener('click', event => {
  event.preventDefault();

  clearInterval(timer);

  currentUsername = inputLoginUsername.value;
  currentPin = Number(inputLoginPin.value);
  const date = new Date();

  let account = accounts.find(
    acc => acc.username === currentUsername && acc.pin === currentPin
  );

  // for (const account of accounts) {
  if (account) {
    // getting current date and showing it somewhere

    // const locale = navigator.language; this gets the browser language and format the date in that order
    // const locale = account.locale;
    // if we need just day, month, and year, we don't need to write the following options constant
    labelDate.textContent = new Intl.DateTimeFormat(account.locale, {
      // weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      // day: '2-digit',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(date);

    containerApp.style.cssText = 'opacity: 1; visibility: visible;';
    showWelcomeMessage(account);
    movementsSum(account);
    displayMovements(account);
    depositsSum(account);
    withdrawalsSum(account);
    interestAmount(account);
    timer = setLogoutTimer();
    // break;
  } else {
    containerApp.style.cssText = 'opacity: 0; visibility: hidden;';
    labelWelcome.textContent = 'Log in to get started';
  }
  // }

  inputLoginUsername.value = null;
  inputLoginPin.value = null;
  sortedMovements = undefined;
  displayAllMovements();
});

/* --------------------- transfer section --------------------- */
btnTransfer.addEventListener('click', event => {
  event.preventDefault();

  clearInterval(timer);
  sortedMovements = undefined;

  const transferTo = inputTransferTo.value;
  let transferAmount = Number((+inputTransferAmount.value).toFixed(2));

  const utcDate = new Date().toISOString();

  let sender = accounts.find(
    acc =>
      acc.username.includes(currentUsername) &&
      currentUsername !== transferTo &&
      transferAmount !== null &&
      transferAmount > 0
  );

  // for (const account of accounts) {
  if (sender) {
    let isReciever = accounts.find(acc => acc.username.includes(transferTo));
    // for (const acc of accounts) {
    if (isReciever) {
      sender.movements.push(-transferAmount);
      sender.movementsDates.push(utcDate);
      if (sender.movements.reduce((acc, value) => acc + value, 0) < 0) {
        sender.movements.pop();
        sender.movementsDates.pop();
        transferAmount = 0;
      }
      // break;
    }
    // }
    depositsSum(sender);
    withdrawalsSum(sender);
    movementsSum(sender);
    displayMovements(sender);
    timer = setLogoutTimer();
  }
  // }

  let reciever = accounts.find(
    acc =>
      currentUsername !== transferTo &&
      acc.username.includes(transferTo) &&
      transferAmount !== null &&
      transferAmount > 0
  );

  // for (const account of accounts) {
  if (reciever) {
    reciever.movements.push(transferAmount);
    reciever.movementsDates.push(utcDate);
    displayAllMovements();
  }
  // break;
  // }

  inputTransferTo.value = null;
  inputTransferAmount.value = null;
});

/* --------------------- loan section --------------------- */
btnLoan.addEventListener('click', event => {
  event.preventDefault();

  clearInterval(timer);

  sortedMovements = undefined;

  loanAmount = Math.floor(inputLoanAmount.value);

  const utcDate = new Date().toISOString();

  let account = accounts.find(
    acc =>
      acc.username.includes(currentUsername) &&
      loanAmount !== null &&
      loanAmount > 0
  );

  // for (const account of accounts) {
  if (account) {
    setTimeout(() => {
      account.movements.push(loanAmount);
      account.movementsDates.push(utcDate);
      depositsSum(account);
      interestAmount(account);
      movementsSum(account);
      displayMovements(account);
      displayAllMovements();
      timer = setLogoutTimer();
    }, 3000);

    // break;
  }
  // }
  inputLoanAmount.value = null;
});

/* --------------------- account close section --------------------- */
btnClose.addEventListener('click', event => {
  event.preventDefault();

  const closeUser = inputCloseUsername.value;
  const closePin = Number(inputClosePin.value);

  let account = accounts.find(acc => acc.username.includes(currentUsername));

  if (currentUsername === closeUser && currentPin === closePin) {
    // for (const account of accounts) {
    if (account) {
      // let index = accounts.indexOf(account);
      let index = accounts.findIndex(acc => acc === account);
      accounts.splice(index, 1);
      containerApp.style.cssText = 'opacity: 0; visibility: hidden;';
      labelWelcome.textContent = 'Log in to get started';
      // break;
    }
    // }
  }
  inputCloseUsername.value = null;
  inputClosePin.value = null;
});

/* --------------------- sort movements section --------------------- */
btnSort.addEventListener('click', () => {
  let account = accounts.find(
    acc => acc.username === currentUsername && acc.pin === currentPin
  );
  // for (const account of accounts) {
  if (account) {
    sortMovements(account);
    // break;
  }
  // }
});

// show the account welcome message
function showWelcomeMessage(account) {
  if (account) {
    let [firstname, ...rest] = account.owner.split(' ');
    labelWelcome.textContent = `Welcome back, ${firstname}`;
  } else labelWelcome.textContent = 'Log in to get started';
}

// getting current date and showing it somewhere
// function currentDate(date, element) {
//   const day = String(date.getDate());
//   const month = String(date.getMonth() + 1).padStart(2, 0);
//   const year = date.getFullYear();
//   const hour = String(date.getHours()).padStart(2, 0);
//   const minute = String(date.getMinutes()).padStart(2, 0);
//   const now = `${day}/${month}/${year}, ${hour}:${minute}`;
//   element.textContent = now;
// }

// format and display movements' dates
function formatMovementsDate(account, date) {
  // const day = String(date.getDate()).padStart(2, 0);
  // const month = String(date.getMonth() + 1).padStart(2, 0);
  // const year = date.getFullYear();

  function daysPassed() {
    const now = Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    );
    const past = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );
    return Math.abs(Math.round((now - past) / (1000 * 60 * 60 * 24)));
  }

  let movementsDate;

  if (daysPassed() === 0) {
    movementsDate = 'Today';
  } else if (daysPassed() === 1) {
    movementsDate = 'yesterday';
  } else if (daysPassed() <= 3) {
    movementsDate = `${daysPassed()} days ago`;
  } else {
    // movementsDate = `${day}/${month}/${year}`;
    const locale = account.locale;
    movementsDate = new Intl.DateTimeFormat(locale).format(date);
  }

  return movementsDate;
}

// display movements corresponds to each account we need
function displayMovements(account) {
  containerMovements.innerHTML = ' ';
  account.movements.forEach(function (mov, i) {
    let type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(account.movementsDates[i]);

    const displayDate = formatMovementsDate(account, date);

    let element = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type.toUpperCase()}</div>
          <div class="movements__date">${displayDate}</div>
    
          <div class="movements__value">${formatCurrency(
            mov.toFixed(2),
            account.locale,
            account.currency
          )}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', element);
  });
}

function formatCurrency(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}

const j = 127736.5543;
console.log(new Intl.NumberFormat(account2.locale).format(j));
console.log(new Intl.NumberFormat(account1.locale).format(j));
console.log(new Intl.NumberFormat('de-DE').format(j));
console.log(new Intl.NumberFormat('fa-IR').format(j));
console.log(j.toFixed(2));

// sum movements up
function movementsSum(account) {
  let balanceValue = account.movements.reduce((acc, value) => acc + value, 0);
  labelBalance.textContent = `${formatCurrency(
    balanceValue.toFixed(2),
    account.locale,
    account.currency
  )}`;
}

// sum up and display withdrawal
function withdrawalsSum(account) {
  let sum = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCurrency(
    sum.toFixed(2),
    account.locale,
    account.currency
  )}`;
}

// sum up and display deposits
function depositsSum(account) {
  let sum = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCurrency(
    sum.toFixed(2),
    account.locale,
    account.currency
  )}`;
}

// loan payback amount
function interestAmount(account) {
  let sumInterest = 0;
  let sumLoan = 0;
  let interest = 0;
  if (!account.interestAmount && !account.sumLoanAmount) {
    account.interestAmount = [];
    account.sumLoanAmount = [];
  }
  interest = loanAmount * account.interestRate;
  account.interestAmount.push(interest);
  sumInterest = account.interestAmount.reduce((acc, int) => acc + int, 0);

  account.sumLoanAmount.push(loanAmount);
  sumLoan = account.sumLoanAmount.reduce((acc, loan) => acc + loan, 0);

  labelSumInterest.textContent = `${formatCurrency(
    sumInterest.toFixed(2),
    account.locale,
    account.currency
  )}`;
  labelSumLoan.textContent = `for ${formatCurrency(
    sumLoan,
    account.locale,
    account.currency
  )}`;
  loanAmount = 0;
}

// sort movements
function sortMovements(account) {
  if (sortedMovements !== undefined) {
    sortedMovements = undefined;
    displayMovements(account);
  } else {
    let a = {
      ...account,
      movements: [account.movements],
      owner: [account.owner],
    };

    // Combine the movements and movementsDates into an array of objects
    let combined = account.movements.map((value, i) => ({
      value,
      date: account.movementsDates[i],
    }));
    // Sort the combined array
    combined.sort((comValue1, comValue2) => comValue1.value - comValue2.value);

    // Split the combined array back into movements and movementsDates
    let mov = combined.map(item => item.value);
    let movDate = combined.map(item => item.date);
    sortedMovements = {
      movements: [...mov],
      movementsDates: [...movDate],
    };

    displayMovements(sortedMovements);
  }
}

// calculate and display all movements
function displayAllMovements() {
  let { all, deposits, withdrawals } = accounts
    .flatMap(acc => acc.movements)
    .reduce(
      (sums, cur) => {
        // we can call an object method in two ways: 1- (.): account.movements 2- ['// must be string']: account['movements']. The second way has an advantage to set and check a condition by ternary operator like in the following line of code and return the desired method into that object. NOTE: the 'sums' is an object of { all, deposits, withdrawals }
        sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
        // or we can use the following method. But its disadvantage is that we need to write this expression: sums.withdrawals += cur twice, once for deposits and once for withdrawals
        // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
        sums['all'] += cur;
        // or sums.all += cur;
        return sums;
      },
      { all: 0, deposits: 0, withdrawals: 0 }
    );

  console.log(
    `there has been a total movements of ${all.toFixed(
      2
    )}€ by this time through the active accounts, which includes ${deposits.toFixed(
      2
    )}€ of deposits and ${withdrawals.toFixed(2)}€ of withdrawals`
  );
}

//
function setLogoutTimer() {
  let time = 299;
  let countDown = setInterval(() => {
    let minute = String(Math.floor(time / 60)).padStart(2, '0');
    let second = String(time % 60).padStart(2, '0');

    labelTimer.textContent = `${minute}:${second}`;

    if (time === 0) {
      clearInterval(countDown);
      containerApp.style.cssText = 'opacity: 0; visibility: hidden;';
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  }, 1000);
  return countDown;
}

let allMovements = accounts
  // .map(mov => mov.movements)
  // .flat()
  // the following code does the same functionality as above with only one line of code but goes one nested deep that in this example is ok
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);

// let allDeposits = accounts
//   // .map(mov => mov.movements)
//   // .flat()
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov > 0)
//   .reduce((acc, mov) => acc + mov, 0);
// let allWithdrawals = accounts
//   // .flatMap(acc => acc.movements)
//   .map(mov => mov.movements)
//   .flat()
//   .filter(mov => mov < 0)
//   .reduce((acc, mov) => acc - mov, 0);

function titleCase(title) {
  let exceptions = [
    'a',
    'an',
    'the',
    'is',
    'are',
    ,
    'was',
    'war',
    'been',
    'and',
    'but',
    'or',
    'on',
    'in',
    'of',
  ];

  const capitzalizer = str => str[0].toUpperCase() + str.slice(1);

  // let firstLetter = str[0].toUpperCase();

  let titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitzalizer(word)))
    .join(' ');
  // .slice(1);
  return capitzalizer(titleCase);
}
console.log(titleCase('my name Is morteza'));
console.log(titleCase('This is a very short text of internet'));
console.log(titleCase('and here we go...'));

// logout timeout
function logout(params) {}

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
// console.log(0.1 + 0.1 === 0.2);
// console.log(0.1 + 0.2 === 0.3);
// console.log(Number('23'));
// console.log(Number('23.3') === 23.3);
// console.log(+'23');
// console.log(Number.parseFloat(0.1 + 0.2));
// console.log(Number.parseFloat('  2.5rem  '));

// console.log(Number.isFinite(20));
// console.log(Number.isFinite(Number.parseInt('20.554')));
// console.log(Number.isFinite(+'20X'));
// console.log(Number.isFinite(23 / 0));

console.log(Math.max(5, 18, '23px', 11, 2));

console.log(Math.PI * Number.parseFloat('10px') ** 2);

// console.log((2.7).toFixed(0));
// console.log((2.7).toFixed(3));
// console.log((2.345).toFixed(2));
// console.log((+2.345).toFixed(2));

const diameter = 287_460_000_000;
console.log(diameter);
console.log(new Date().toISOString());
console.log('-----------------');
console.log(new Date('Aug 02 2020 18:05:41'));
console.log(new Date('December 24, 2015'));
console.log(new Date(account1.movementsDates[0]));
console.log('-----------------');
const now = new Date();
console.log(Date.now());

console.log('-------------------------');
console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor('23.9'));

console.log(Math.trunc(23.3));
console.log(Math.trunc(23.9));

console.log(Math.trunc(-23.3));
console.log(Math.floor(-23.3));

console.log('++++++++++++++++++++++++++++++++++++++');
console.log(new Date().toISOString());
console.log(Date.UTC(new Date().getUTCFullYear()));
const sec = new Date('2024-05-20T21:49:59.371Z');
console.log(
  Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  )
);
console.log('t');
console.log(
  Date.UTC(sec.getUTCFullYear(), sec.getUTCMonth(), sec.getUTCDate())
);
console.log(Date.UTC(new Date().getUTCDate()));
console.log(new Date().getTime());
console.log(
  // new Date(
  Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
    new Date().getUTCMinutes()
  )
  // )
);

console.log('=====================================');
const future = new Date();
// 2037, 10, 19, 15, 23
console.log(future.toISOString());
console.log(future.getUTCDate());
console.log(future.getUTCFullYear() === future.getFullYear());
console.log(future.getUTCSeconds() === future.getTime());
console.log(future.getUTCSeconds());
console.log(future.getTime());
console.log(new Date(2142256980000));
console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
// const time = setInterval(() => {
//   const dt = new Date();
//   let formatedTime = new Intl.DateTimeFormat('fa-IR', {
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//   }).format(dt);
//   console.log(formatedTime);
// }, 1000);

console.log(Number.parseInt(32, 2));
let randomNumber = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
console.log(randomNumber);

// var date = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
// var options = {
//   weekday: 'long',
//   year: 'numeric',
//   month: 'long',
//   day: 'numeric',
// };
// console.log(new Intl.DateTimeFormat('de-DE', options).format(date));

// var date = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
// var options = {
//   localeMatcher: 'best fit',
//   calendar: 'gregory',
//   numberingSystem: 'arab',
//   hour12: true,
//   hourCycle: 'h12',
//   timeZone: 'America/New_York',
// };
// console.log(new Intl.DateTimeFormat('en-US', options).format(date));

// Example of using 'format'
// var date = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
// var formatter = new Intl.DateTimeFormat('en-US');
// console.log(formatter.format(date));

// Example of using 'formatRange'
var date1 = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
var date2 = new Date(Date.UTC(2012, 11, 21, 3, 0, 0));
var formatter = new Intl.DateTimeFormat('en-US');
console.log(formatter.formatRange(date1, date2));

// // Example of using 'formatRangeToParts'
// var date1 = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
// var date2 = new Date(Date.UTC(2012, 11, 21, 3, 0, 0));
// var formatter = new Intl.DateTimeFormat('en-US');
// console.log(formatter.formatRangeToParts(date1, date2));

// // Example of using 'formatToParts'
// var date = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
// var formatter = new Intl.DateTimeFormat('en-US');
// console.log(formatter.formatToParts(date));

// // Example of using 'resolvedOptions'
// var formatter = new Intl.DateTimeFormat('en-US');
// console.log(formatter.resolvedOptions());

// Example of using 'localeMatcher' and 'numberingSystem'
// var number = 123456.789;
// var options = {
//   localeMatcher: 'best fit',
//   numberingSystem: 'mathans',
// };
// console.log(new Intl.NumberFormat('en-US', options).format(number));

// Example of using 'style', 'currency', 'currencyDisplay', 'currencySign', and 'unit'
// var number = 123456.789;
// var options = {
//   style: 'currency',
//   currency: 'USD',
//   currencyDisplay: 'symbol',
//   currencySign: 'standard',
//   unit: 'mile-per-hour',
// };
// console.log(new Intl.NumberFormat('en-US', options).format(number));

// Example of using 'format'
var number = 123456.789;
var formatter = new Intl.NumberFormat('en-US');
console.log(formatter.format(number));

// Example of using 'formatRange'
var number1 = 123456.789;
var number2 = 987654.321;
var formatter = new Intl.NumberFormat('en-US');
console.log(formatter.formatRange(number1, number2));

// Example of using 'formatRangeToParts'
var number1 = 123456.789;
var number2 = 987654.321;
var formatter = new Intl.NumberFormat('en-US');
console.log(formatter.formatRangeToParts(number1, number2));

// Example of using 'formatToParts'
var number = 123456.789;
var formatter = new Intl.NumberFormat('en-US');
console.log(formatter.formatToParts(number));

// Example of using 'resolvedOptions'
var formatter = new Intl.NumberFormat('en-US');
console.log(formatter.resolvedOptions());
