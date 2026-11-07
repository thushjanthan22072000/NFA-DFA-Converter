# NFA to DFA Visualizer

An interactive browser-based tool for creating, testing, and converting a Non-deterministic Finite Automaton (NFA) into a Deterministic Finite Automaton (DFA).

## Features

- Create and delete states
- Set the start state
- Mark one or more final states
- Add and remove transitions
- Draw and drag states in the NFA diagram
- Convert an NFA to a DFA using subset construction
- Display the generated DFA states and transition table
- Test an input string against the NFA and view its state path
- Clear the automaton and start again
- Responsive interface

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- SVG for transition drawing

## Run locally

1. Download or clone this repository.
2. Keep `index.html`, `style.css`, and `script.js` in the same folder.
3. Open `index.html` in a web browser.

No package installation or backend server is required.

## How to use

1. Add states, such as `q0`, `q1`, and `q2`.
2. Select **Set Start State**, then click the desired state.
3. Select **Set Final State**, then click the accepting state or states.
4. Add transitions by choosing a source state, input symbol, and destination state.
5. Click **Convert NFA → DFA** to generate the DFA transition table.
6. Enter a test string and click **Check String** to see whether the NFA accepts or rejects it.

## Project structure

```text
NFA-DFA-Converter/
├── index.html
├── style.css
├── script.js
├── README.md
└── .gitignore
```

## Purpose

This project is an educational aid for learning finite automata, NFA simulation, and the subset-construction method used to convert an NFA into a DFA.
