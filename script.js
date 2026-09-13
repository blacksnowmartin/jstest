const concepts = [
  {
    title: 'Variables',
    summary: 'Variables store data so your program can remember values and update them over time.',
    code: `let points = 4500;
const bonus = 500;
points = points + bonus;
console.log("Total points:", points);`,
    trace: [
      { line: 0, text: 'Create a variable named points and assign 4500.' },
      { line: 1, text: 'Create a constant called bonus and keep the value 500.' },
      { line: 2, text: 'Update points by adding the bonus amount.' },
      { line: 3, text: 'Print the final value to the console.' }
    ],
    run: () => {
      let points = 4500;
      const bonus = 500;
      points = points + bonus;
      return `Total points: ${points}`;
    }
  },
  {
    title: 'Operators',
    summary: 'Operators let you calculate, compare, and combine values to make decisions and change data.',
    code: `const health = 85;
const potion = 15;
const total = health + potion;
const isHealthy = total > 90;
console.log("After potion:", total, isHealthy);`,
    trace: [
      { line: 0, text: 'Store the current health value.' },
      { line: 1, text: 'Store the amount provided by the potion.' },
      { line: 2, text: 'Use the + operator to add both numbers.' },
      { line: 3, text: 'Use > to compare the result against 90.' },
      { line: 4, text: 'Print the final values to the console.' }
    ],
    run: () => {
      const health = 85;
      const potion = 15;
      const total = health + potion;
      const isHealthy = total > 90;
      return `After potion: ${total} ${isHealthy}`;
    }
  },
  {
    title: 'Conditionals',
    summary: 'Conditionals check a true or false statement and run the right block of code for each case.',
    code: `let points = 4500;
let rank;

if (points >= 10000) {
  rank = "Legend";
} else if (points >= 5000) {
  rank = "Diamond";
} else if (points >= 2000) {
  rank = "Gold";
} else {
  rank = "Bronze";
}

console.log(rank);`,
    trace: [
      { line: 0, text: 'Set the score for this example.' },
      { line: 2, text: 'Check whether the first condition is true.' },
      { line: 4, text: 'If not, try the next condition.' },
      { line: 6, text: 'When one condition matches, assign a rank.' },
      { line: 10, text: 'Display the final rank.' }
    ],
    run: () => {
      let points = 4500;
      let rank;

      if (points >= 10000) {
        rank = 'Legend';
      } else if (points >= 5000) {
        rank = 'Diamond';
      } else if (points >= 2000) {
        rank = 'Gold';
      } else {
        rank = 'Bronze';
      }

      return rank;
    }
  },
  {
    title: 'Loops',
    summary: 'Loops repeat code automatically, which is useful when you want to handle lists or perform an action several times.',
    code: `for (let i = 1; i <= 3; i++) {
  console.log("Round " + i);
}`,
    trace: [
      { line: 0, text: 'Start a loop with i equal to 1.' },
      { line: 1, text: 'Run the code inside the loop.' },
      { line: 0, text: 'Increase i by 1 and check the condition again.' }
    ],
    run: () => {
      let result = '';
      for (let i = 1; i <= 3; i++) {
        result += `Round ${i}\n`;
      }
      return result.trim();
    }
  },
  {
    title: 'Functions',
    summary: 'Functions package logic into reusable blocks so your code can do the same thing again without repeating yourself.',
    code: `function greet(name) {
  return "Hello, " + name + "!";
}

const message = greet("Ava");
console.log(message);`,
    trace: [
      { line: 0, text: 'Define a function with a parameter named name.' },
      { line: 1, text: 'Return a greeting using the parameter value.' },
      { line: 4, text: 'Call the function and store the result.' },
      { line: 5, text: 'Show the greeting in the console.' }
    ],
    run: () => {
      function greet(name) {
        return `Hello, ${name}!`;
      }

      const message = greet('Ava');
      return message;
    }
  },
  {
    title: 'Objects',
    summary: 'Objects group related values together, making it easier to model real-world things like a player or a product.',
    code: `const player = {
  name: "Sam",
  health: 80,
  level: 3
};

player.health += 20;
console.log(player.name + " has " + player.health + " health");`,
    trace: [
      { line: 0, text: 'Create an object with properties for the player.' },
      { line: 4, text: 'Update the health value using +=.' },
      { line: 5, text: 'Read properties and print the final result.' }
    ],
    run: () => {
      const player = {
        name: 'Sam',
        health: 80,
        level: 3
      };

      player.health += 20;
      return `${player.name} has ${player.health} health`;
    }
  },
  {
    title: 'DOM & Events',
    summary: 'Document Object Model (DOM) code lets JavaScript change the HTML and respond to user actions like clicks.',
    code: `const button = document.querySelector("button");
button.addEventListener("click", () => {
  button.textContent = "Clicked!";
});`,
    trace: [
      { line: 0, text: 'Find the button in the page.' },
      { line: 1, text: 'Listen for a click event on the button.' },
      { line: 2, text: 'When clicked, update the button text.' }
    ],
    run: () => {
      const demoButton = document.createElement('button');
      demoButton.textContent = 'Click me';
      demoButton.click();
      return demoButton.textContent;
    }
  }
];

const conceptNav = document.getElementById('concept-nav');
const conceptTitle = document.getElementById('concept-title');
const conceptSummary = document.getElementById('concept-summary');
const codeBlock = document.getElementById('code-block');
const traceList = document.getElementById('trace-list');
const outputBox = document.getElementById('output-box');
const runExampleButton = document.getElementById('run-example');
const nextTraceButton = document.getElementById('next-trace');

let activeConceptIndex = 0;
let activeTraceIndex = 0;

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderNav() {
  conceptNav.innerHTML = concepts
    .map(
      (concept, index) => `
        <button class="nav-item ${index === activeConceptIndex ? 'active' : ''}" data-index="${index}">
          ${concept.title}
        </button>
      `
    )
    .join('');

  conceptNav.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      activeConceptIndex = Number(button.dataset.index);
      activeTraceIndex = 0;
      renderConcept();
    });
  });
}

function renderCode(concept, traceStepIndex) {
  const lines = concept.code.split('\n');
  const stepLine = concept.trace[Math.min(traceStepIndex, concept.trace.length - 1)]?.line ?? 0;

  codeBlock.innerHTML = lines
    .map((line, index) => {
      const isActive = index === stepLine;
      const lineNumber = String(index + 1).padStart(2, '0');
      return `
        <div class="code-line ${isActive ? 'highlight' : ''}">
          <span class="line-number">${lineNumber}</span>
          <span>${escapeHtml(line || '&nbsp;')}</span>
        </div>
      `;
    })
    .join('');
}

function renderTrace(concept) {
  traceList.innerHTML = concept.trace
    .map(
      (step, index) => `
        <li class="${index === activeTraceIndex ? 'active' : ''}">${step.text}</li>
      `
    )
    .join('');
}

function renderConcept() {
  const concept = concepts[activeConceptIndex];
  conceptTitle.textContent = concept.title;
  conceptSummary.textContent = concept.summary;
  renderNav();
  renderCode(concept, activeTraceIndex);
  renderTrace(concept);
  outputBox.textContent = 'Press “Run example” to see the result.';
}

runExampleButton.addEventListener('click', () => {
  const concept = concepts[activeConceptIndex];
  outputBox.textContent = concept.run();
});

nextTraceButton.addEventListener('click', () => {
  const concept = concepts[activeConceptIndex];
  activeTraceIndex = (activeTraceIndex + 1) % concept.trace.length;
  renderCode(concept, activeTraceIndex);
  renderTrace(concept);
});

renderConcept();