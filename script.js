/* =========================================================
   NFA → DFA VISUALIZER
   ========================================================= */


/* =========================================================
   GLOBAL DATA
   ========================================================= */

const app = {

    states: [],

    transitions: [],

    startState: null,

    finalStates: new Set(),

    selectedState: null,

    mode: "normal"

};


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const stateNameInput =
    document.getElementById("stateName");

const addStateBtn =
    document.getElementById("addStateBtn");

const setStartModeBtn =
    document.getElementById("setStartModeBtn");

const setFinalModeBtn =
    document.getElementById("setFinalModeBtn");

const deleteStateBtn =
    document.getElementById("deleteStateBtn");

const stateList =
    document.getElementById("stateList");

const fromState =
    document.getElementById("fromState");

const toState =
    document.getElementById("toState");

const transitionSymbol =
    document.getElementById("transitionSymbol");

const addTransitionBtn =
    document.getElementById("addTransitionBtn");

const transitionList =
    document.getElementById("transitionList");

const convertBtn =
    document.getElementById("convertBtn");

const clearBtn =
    document.getElementById("clearBtn");

const stateCanvas =
    document.getElementById("stateCanvas");

const connectionSvg =
    document.getElementById("connectionSvg");

const statusEl =
    document.getElementById("status");

const dfaMessage =
    document.getElementById("dfaMessage");

const dfaResult =
    document.getElementById("dfaResult");

const dfaStateCount =
    document.getElementById("dfaStateCount");

const dfaStart =
    document.getElementById("dfaStart");

const dfaFinal =
    document.getElementById("dfaFinal");

const dfaTableBody =
    document.querySelector("#dfaTable tbody");


/* STRING TEST ELEMENTS */

const testStringInput =
    document.getElementById("testString");

const checkStringBtn =
    document.getElementById("checkStringBtn");

const stringResult =
    document.getElementById("stringResult");

const stringPath =
    document.getElementById("stringPath");


/* =========================================================
   ADD STATE
   ========================================================= */

addStateBtn.addEventListener(
    "click",
    addState
);


stateNameInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            addState();

        }

    }
);


function addState() {

    const name =
        stateNameInput.value.trim();


    if (!name) {

        setStatus(
            "Enter a state name."
        );

        return;
    }


    if (app.states.includes(name)) {

        setStatus(
            "State already exists."
        );

        return;
    }


    app.states.push(name);

    stateNameInput.value = "";


    createStateElement(name);

    updateStateSelects();

    updateStateList();


    setStatus(
        `State ${name} added.`
    );

}


/* =========================================================
   CREATE STATE
   ========================================================= */

function createStateElement(name) {

    const element =
        document.createElement("div");


    element.className = "state";

    element.textContent = name;

    element.dataset.name = name;


    const index =
        app.states.indexOf(name);


    const columns = 5;

    const row =
        Math.floor(index / columns);

    const column =
        index % columns;


    const x =
        100 + column * 140;

    const y =
        100 + row * 120;


    element.style.left =
        `${x}px`;

    element.style.top =
        `${y}px`;


    element.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            handleStateClick(name);

        }
    );


    makeDraggable(
        element,
        name
    );


    stateCanvas.appendChild(
        element
    );

}


/* =========================================================
   DRAG STATE
   ========================================================= */

function makeDraggable(
    element,
    name
) {

    let dragging = false;

    let offsetX = 0;

    let offsetY = 0;


    element.addEventListener(
        "mousedown",
        function (event) {

            if (app.mode !== "normal") {

                return;

            }


            dragging = true;


            const rect =
                element.getBoundingClientRect();


            offsetX =
                event.clientX -
                rect.left;

            offsetY =
                event.clientY -
                rect.top;


            element.style.cursor =
                "grabbing";

        }
    );


    document.addEventListener(
        "mousemove",
        function (event) {

            if (!dragging) {

                return;

            }


            const container =
                document.getElementById(
                    "canvasContainer"
                );


            const rect =
                container.getBoundingClientRect();


            let x =
                event.clientX -
                rect.left -
                offsetX +
                32;


            let y =
                event.clientY -
                rect.top -
                offsetY +
                32;


            x =
                Math.max(
                    35,
                    Math.min(
                        rect.width - 35,
                        x
                    )
                );


            y =
                Math.max(
                    35,
                    Math.min(
                        rect.height - 35,
                        y
                    )
                );


            element.style.left =
                `${x}px`;

            element.style.top =
                `${y}px`;


            drawTransitions();

        }
    );


    document.addEventListener(
        "mouseup",
        function () {

            dragging = false;

            element.style.cursor =
                "pointer";

        }
    );

}


/* =========================================================
   STATE CLICK
   ========================================================= */

function handleStateClick(name) {


    /* SET START */

    if (app.mode === "setStart") {

        app.startState = name;

        app.mode = "normal";


        setStartModeBtn.classList.remove(
            "active"
        );


        updateStateVisuals();

        updateStateList();


        setStatus(
            `Start state set to ${name}.`
        );


        return;
    }


    /* SET FINAL */

    if (app.mode === "setFinal") {

        if (
            app.finalStates.has(name)
        ) {

            app.finalStates.delete(
                name
            );

            setStatus(
                `${name} removed from final states.`
            );

        } else {

            app.finalStates.add(
                name
            );

            setStatus(
                `${name} is now a final state.`
            );

        }


        updateStateVisuals();

        updateStateList();


        return;
    }


    /* NORMAL */

    selectState(name);

}


/* =========================================================
   SELECT STATE
   ========================================================= */

function selectState(name) {

    app.selectedState = name;


    document
        .querySelectorAll(".state")
        .forEach(
            element => {

                element.classList.remove(
                    "selected"
                );

            }
        );


    const element =
        document.querySelector(
            `.state[data-name="${CSS.escape(name)}"]`
        );


    if (element) {

        element.classList.add(
            "selected"
        );

    }


    setStatus(
        `Selected state: ${name}`
    );

}


/* =========================================================
   START STATE
   ========================================================= */

setStartModeBtn.addEventListener(
    "click",
    function () {

        if (app.states.length === 0) {

            setStatus(
                "Create states first."
            );

            return;
        }


        app.mode =
            app.mode === "setStart"
                ? "normal"
                : "setStart";


        setStartModeBtn.classList.toggle(
            "active",
            app.mode === "setStart"
        );


        setFinalModeBtn.classList.remove(
            "active"
        );


        if (
            app.mode === "setStart"
        ) {

            setStatus(
                "Click a state to make it START."
            );

        } else {

            setStatus(
                "Normal mode."
            );

        }

    }
);


/* =========================================================
   FINAL STATE
   ========================================================= */

setFinalModeBtn.addEventListener(
    "click",
    function () {

        if (app.states.length === 0) {

            setStatus(
                "Create states first."
            );

            return;
        }


        app.mode =
            app.mode === "setFinal"
                ? "normal"
                : "setFinal";


        setFinalModeBtn.classList.toggle(
            "active",
            app.mode === "setFinal"
        );


        setStartModeBtn.classList.remove(
            "active"
        );


        if (
            app.mode === "setFinal"
        ) {

            setStatus(
                "Click states to toggle FINAL status."
            );

        } else {

            setStatus(
                "Normal mode."
            );

        }

    }
);


/* =========================================================
   UPDATE STATE VISUALS
   ========================================================= */

function updateStateVisuals() {

    document
        .querySelectorAll(".state")
        .forEach(
            element => {

                const name =
                    element.dataset.name;


                element.classList.toggle(
                    "start",
                    name === app.startState
                );


                element.classList.toggle(
                    "final",
                    app.finalStates.has(name)
                );

            }
        );

}


/* =========================================================
   STATE LIST
   ========================================================= */

function updateStateList() {

    stateList.innerHTML = "";


    app.states.forEach(
        name => {

            const item =
                document.createElement("div");


            item.className =
                "list-item";


            const left =
                document.createElement("span");


            left.textContent =
                name;


            const right =
                document.createElement("span");


            if (
                name === app.startState
            ) {

                const start =
                    document.createElement("span");


                start.className =
                    "start-label";


                start.textContent =
                    "START";


                right.appendChild(
                    start
                );

            }


            if (
                app.finalStates.has(name)
            ) {

                const final =
                    document.createElement("span");


                final.className =
                    "final-label";


                final.textContent =
                    " FINAL";


                right.appendChild(
                    final
                );

            }


            item.appendChild(left);

            item.appendChild(right);

            stateList.appendChild(item);

        }
    );

}


/* =========================================================
   DELETE STATE
   ========================================================= */

deleteStateBtn.addEventListener(
    "click",
    deleteSelectedState
);


function deleteSelectedState() {

    if (!app.selectedState) {

        setStatus(
            "Select a state first."
        );

        return;
    }


    const name =
        app.selectedState;


    app.states =
        app.states.filter(
            state =>
                state !== name
        );


    app.transitions =
        app.transitions.filter(
            transition =>
                transition.from !== name &&
                transition.to !== name
        );


    if (
        app.startState === name
    ) {

        app.startState = null;

    }


    app.finalStates.delete(
        name
    );


    const element =
        document.querySelector(
            `.state[data-name="${CSS.escape(name)}"]`
        );


    if (element) {

        element.remove();

    }


    app.selectedState = null;


    updateStateSelects();

    updateStateList();

    drawTransitions();


    setStatus(
        `State ${name} deleted.`
    );

}


/* =========================================================
   UPDATE SELECTS
   ========================================================= */

function updateStateSelects() {

    [
        fromState,
        toState
    ].forEach(
        select => {

            const previous =
                select.value;


            select.innerHTML =
                `<option value="">
                    Select state
                </option>`;


            app.states.forEach(
                state => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        state;

                    option.textContent =
                        state;


                    select.appendChild(
                        option
                    );

                }
            );


            if (
                app.states.includes(previous)
            ) {

                select.value =
                    previous;

            }

        }
    );

}


/* =========================================================
   ADD TRANSITION
   ========================================================= */

addTransitionBtn.addEventListener(
    "click",
    addTransition
);


function addTransition() {

    const from =
        fromState.value;

    const symbol =
        transitionSymbol.value.trim();

    const to =
        toState.value;


    if (
        !from ||
        !symbol ||
        !to
    ) {

        setStatus(
            "Select FROM, enter symbol and select TO."
        );

        return;
    }


    const exists =
        app.transitions.some(
            transition =>
                transition.from === from &&
                transition.symbol === symbol &&
                transition.to === to
        );


    if (exists) {

        setStatus(
            "This transition already exists."
        );

        return;
    }


    app.transitions.push({

        from: from,

        symbol: symbol,

        to: to

    });


    transitionSymbol.value = "";


    updateTransitionList();

    drawTransitions();


    setStatus(
        `${from} --${symbol}--> ${to} added.`
    );

}


/* =========================================================
   TRANSITION LIST
   ========================================================= */

function updateTransitionList() {

    transitionList.innerHTML = "";


    app.transitions.forEach(
        (transition, index) => {

            const item =
                document.createElement("div");


            item.className =
                "list-item";


            const text =
                document.createElement("span");


            text.textContent =
                `${transition.from} --${transition.symbol}--> ${transition.to}`;


            const deleteBtn =
                document.createElement("button");


            deleteBtn.textContent =
                "×";


            deleteBtn.style.padding =
                "2px 8px";


            deleteBtn.style.background =
                "#ef4444";


            deleteBtn.style.color =
                "white";


            deleteBtn.addEventListener(
                "click",
                function () {

                    app.transitions.splice(
                        index,
                        1
                    );


                    updateTransitionList();

                    drawTransitions();


                    setStatus(
                        "Transition deleted."
                    );

                }
            );


            item.appendChild(text);

            item.appendChild(deleteBtn);

            transitionList.appendChild(item);

        }
    );

}


/* =========================================================
   DRAW TRANSITIONS
   ========================================================= */

function drawTransitions() {

    connectionSvg.innerHTML = "";


    /* Arrow */

    const defs =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "defs"
        );


    const marker =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "marker"
        );


    marker.setAttribute(
        "id",
        "arrow"
    );

    marker.setAttribute(
        "markerWidth",
        "10"
    );

    marker.setAttribute(
        "markerHeight",
        "10"
    );

    marker.setAttribute(
        "refX",
        "9"
    );

    marker.setAttribute(
        "refY",
        "3"
    );

    marker.setAttribute(
        "orient",
        "auto"
    );


    const arrowPath =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );


    arrowPath.setAttribute(
        "d",
        "M0,0 L0,6 L9,3 z"
    );


    arrowPath.setAttribute(
        "fill",
        "#94a3b8"
    );


    marker.appendChild(
        arrowPath
    );

    defs.appendChild(
        marker
    );

    connectionSvg.appendChild(
        defs
    );


    /* Group transitions */

    const groups = {};


    app.transitions.forEach(
        transition => {

            const key =
                `${transition.from}__${transition.to}`;


            if (!groups[key]) {

                groups[key] = [];

            }


            groups[key].push(
                transition.symbol
            );

        }
    );


    Object.keys(groups).forEach(
        key => {

            const parts =
                key.split("__");


            const from =
                parts[0];

            const to =
                parts[1];


            const fromElement =
                document.querySelector(
                    `.state[data-name="${CSS.escape(from)}"]`
                );


            const toElement =
                document.querySelector(
                    `.state[data-name="${CSS.escape(to)}"]`
                );


            if (
                !fromElement ||
                !toElement
            ) {

                return;

            }


            const container =
                document.getElementById(
                    "canvasContainer"
                );


            const containerRect =
                container.getBoundingClientRect();


            const fromRect =
                fromElement.getBoundingClientRect();


            const toRect =
                toElement.getBoundingClientRect();


            const x1 =
                fromRect.left -
                containerRect.left +
                fromRect.width / 2;


            const y1 =
                fromRect.top -
                containerRect.top +
                fromRect.height / 2;


            const x2 =
                toRect.left -
                containerRect.left +
                toRect.width / 2;


            const y2 =
                toRect.top -
                containerRect.top +
                toRect.height / 2;


            const symbols =
                groups[key].join(", ");


            /* SELF LOOP */

            if (from === to) {

                drawSelfLoop(
                    x1,
                    y1,
                    symbols
                );

                return;
            }


            const dx =
                x2 - x1;

            const dy =
                y2 - y1;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (distance === 0) {

                return;

            }


            const offsetX =
                (dx / distance) * 32;

            const offsetY =
                (dy / distance) * 32;


            const startX =
                x1 + offsetX;

            const startY =
                y1 + offsetY;


            const endX =
                x2 - offsetX;

            const endY =
                y2 - offsetY;


            const line =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                );


            line.setAttribute(
                "x1",
                startX
            );

            line.setAttribute(
                "y1",
                startY
            );

            line.setAttribute(
                "x2",
                endX
            );

            line.setAttribute(
                "y2",
                endY
            );


            line.classList.add(
                "transition-line"
            );


            connectionSvg.appendChild(
                line
            );


            const label =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text"
                );


            label.textContent =
                symbols;


            label.setAttribute(
                "x",
                (startX + endX) / 2
            );


            label.setAttribute(
                "y",
                (startY + endY) / 2 - 8
            );


            label.setAttribute(
                "text-anchor",
                "middle"
            );


            label.classList.add(
                "transition-label"
            );


            connectionSvg.appendChild(
                label
            );

        }
    );

}


/* =========================================================
   SELF LOOP
   ========================================================= */

function drawSelfLoop(
    x,
    y,
    symbol
) {

    const path =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );


    path.setAttribute(
        "d",
        `M ${x - 20} ${y - 25}
         C ${x - 70} ${y - 85},
           ${x + 70} ${y - 85},
           ${x + 20} ${y - 25}`
    );


    path.classList.add(
        "transition-line"
    );


    connectionSvg.appendChild(
        path
    );


    const label =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );


    label.textContent =
        symbol;


    label.setAttribute(
        "x",
        x
    );


    label.setAttribute(
        "y",
        y - 70
    );


    label.setAttribute(
        "text-anchor",
        "middle"
    );


    label.classList.add(
        "transition-label"
    );


    connectionSvg.appendChild(
        label
    );

}


/* =========================================================
   NFA → DFA CONVERSION
   ========================================================= */

convertBtn.addEventListener(
    "click",
    convertNFAtoDFA
);


function convertNFAtoDFA() {

    if (app.states.length === 0) {

        setStatus(
            "Create states first."
        );

        return;
    }


    if (!app.startState) {

        setStatus(
            "Set a start state first."
        );

        return;
    }


    const alphabet =
        getAlphabet();


    if (alphabet.length === 0) {

        setStatus(
            "Add at least one transition."
        );

        return;
    }


    const dfaStates = [];

    const dfaTransitions = [];

    const queue = [];


    const startSet =
        new Set([
            app.startState
        ]);


    const startKey =
        setKey(startSet);


    dfaStates.push({

        key: startKey,

        states: startSet

    });


    queue.push(startSet);


    const processed =
        new Set();


    while (
        queue.length > 0
    ) {

        const currentSet =
            queue.shift();


        const currentKey =
            setKey(currentSet);


        if (
            processed.has(currentKey)
        ) {

            continue;

        }


        processed.add(
            currentKey
        );


        alphabet.forEach(
            symbol => {

                const destination =
                    new Set();


                currentSet.forEach(
                    state => {

                        app.transitions
                            .filter(
                                transition =>
                                    transition.from === state &&
                                    transition.symbol === symbol
                            )
                            .forEach(
                                transition => {

                                    destination.add(
                                        transition.to
                                    );

                                }
                            );

                    }
                );


                const destinationKey =
                    setKey(destination);


                if (
                    destination.size > 0
                ) {

                    if (
                        !dfaStates.some(
                            dfaState =>
                                dfaState.key ===
                                destinationKey
                        )
                    ) {

                        dfaStates.push({

                            key:
                                destinationKey,

                            states:
                                destination

                        });


                        queue.push(
                            destination
                        );

                    }

                }


                dfaTransitions.push({

                    from:
                        currentKey,

                    symbol:
                        symbol,

                    to:
                        destination.size > 0
                            ? destinationKey
                            : "∅"

                });

            }
        );

    }


    displayDFA(
        dfaStates,
        dfaTransitions,
        alphabet
    );


    setStatus(
        "NFA successfully converted to DFA."
    );

}


/* =========================================================
   GET ALPHABET
   ========================================================= */

function getAlphabet() {

    const symbols =
        new Set();


    app.transitions.forEach(
        transition => {

            if (
                transition.symbol !== "ε"
            ) {

                symbols.add(
                    transition.symbol
                );

            }

        }
    );


    return [
        ...symbols
    ].sort();

}


/* =========================================================
   SET KEY
   ========================================================= */

function setKey(set) {

    if (
        set.size === 0
    ) {

        return "∅";

    }


    return [
        ...set
    ]
        .sort()
        .join(",");
}


/* =========================================================
   DISPLAY DFA
   ========================================================= */

function displayDFA(
    dfaStates,
    dfaTransitions,
    alphabet
) {

    dfaMessage.classList.add(
        "hidden"
    );


    dfaResult.classList.remove(
        "hidden"
    );


    dfaStateCount.textContent =
        dfaStates.length;


    const startKey =
        setKey(
            new Set([
                app.startState
            ])
        );


    dfaStart.textContent =
        `{${startKey}}`;


    const finalStates =
        dfaStates
            .filter(
                dfaState => {

                    return [
                        ...dfaState.states
                    ].some(
                        state =>
                            app.finalStates.has(
                                state
                            )
                    );

                }
            )
            .map(
                dfaState =>
                    `{${dfaState.key}}`
            );


    dfaFinal.textContent =
        finalStates.length > 0
            ? finalStates.join(", ")
            : "None";


    dfaTableBody.innerHTML =
        "";


    /* Header */

    const headerRow =
        document.querySelector(
            "#dfaTable thead tr"
        );


    headerRow.innerHTML =
        "<th>State</th>";


    alphabet.forEach(
        symbol => {

            const th =
                document.createElement(
                    "th"
                );


            th.textContent =
                symbol;


            headerRow.appendChild(
                th
            );

        }
    );


    /* Rows */

    dfaStates.forEach(
        dfaState => {

            const row =
                document.createElement(
                    "tr"
                );


            const stateCell =
                document.createElement(
                    "td"
                );


            stateCell.textContent =
                `{${dfaState.key}}`;


            row.appendChild(
                stateCell
            );


            alphabet.forEach(
                symbol => {

                    const cell =
                        document.createElement(
                            "td"
                        );


                    const transition =
                        dfaTransitions.find(
                            transition =>
                                transition.from ===
                                    dfaState.key &&
                                transition.symbol ===
                                    symbol
                        );


                    cell.textContent =
                        transition
                            ? `{${transition.to}}`
                            : "∅";


                    row.appendChild(
                        cell
                    );

                }
            );


            dfaTableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   STRING ACCEPTANCE TEST
   ========================================================= */

checkStringBtn.addEventListener(
    "click",
    checkString
);


testStringInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            checkString();

        }

    }
);


function checkString() {

    const input =
        testStringInput.value.trim();


    /* -----------------------------------------
       EMPTY STRING
    ----------------------------------------- */

    if (input === "") {

        stringResult.innerHTML =
            `<span class="result-rejected">
                ⚠️ Please enter a string.
            </span>`;


        stringPath.innerHTML =
            "";


        return;

    }


    /* -----------------------------------------
       START STATE
    ----------------------------------------- */

    if (!app.startState) {

        stringResult.innerHTML =
            `<span class="result-rejected">
                ⚠️ Please set a START state first.
            </span>`;


        stringPath.innerHTML =
            "";


        return;

    }


    /* -----------------------------------------
       FINAL STATE
    ----------------------------------------- */

    if (
        app.finalStates.size === 0
    ) {

        stringResult.innerHTML =
            `<span class="result-rejected">
                ⚠️ Please set at least one FINAL state.
            </span>`;


        stringPath.innerHTML =
            "";


        return;

    }


    /* -----------------------------------------
       NFA SIMULATION
    ----------------------------------------- */

    let currentStates =
        new Set([
            app.startState
        ]);


    const path = [];


    path.push(
        `{${[
            ...currentStates
        ].join(", ")}}`
    );


    /* -----------------------------------------
       PROCESS EACH CHARACTER
    ----------------------------------------- */

    for (
        const symbol of input
    ) {

        const nextStates =
            new Set();


        currentStates.forEach(
            state => {

                app.transitions.forEach(
                    transition => {

                        if (
                            transition.from === state &&
                            transition.symbol === symbol
                        ) {

                            nextStates.add(
                                transition.to
                            );

                        }

                    }
                );

            }
        );


        currentStates =
            nextStates;


        if (
            currentStates.size > 0
        ) {

            path.push(
                `{${[
                    ...currentStates
                ].join(", ")}}`
            );

        } else {

            path.push(
                "∅"
            );

        }


        if (
            currentStates.size === 0
        ) {

            break;

        }

    }


    /* -----------------------------------------
       CHECK FINAL STATE
    ----------------------------------------- */

    let accepted = false;


    currentStates.forEach(
        state => {

            if (
                app.finalStates.has(
                    state
                )
            ) {

                accepted = true;

            }

        }
    );


    /* -----------------------------------------
       SHOW RESULT
    ----------------------------------------- */

    if (accepted) {

        stringResult.innerHTML =
            `<span class="result-accepted">
                ✅ ACCEPTED
            </span>`;

    } else {

        stringResult.innerHTML =
            `<span class="result-rejected">
                ❌ REJECTED
            </span>`;

    }


    /* -----------------------------------------
       SHOW PATH
    ----------------------------------------- */

    stringPath.innerHTML =
        `<strong>State Path:</strong><br>
        ${path.join(" → ")}`;

}


/* =========================================================
   CLEAR EVERYTHING
   ========================================================= */

clearBtn.addEventListener(
    "click",
    clearEverything
);


function clearEverything() {

    app.states = [];

    app.transitions = [];

    app.startState = null;

    app.finalStates.clear();

    app.selectedState = null;

    app.mode = "normal";


    stateCanvas.innerHTML =
        "";

    connectionSvg.innerHTML =
        "";

    stateList.innerHTML =
        "";

    transitionList.innerHTML =
        "";


    updateStateSelects();


    dfaMessage.classList.remove(
        "hidden"
    );


    dfaResult.classList.add(
        "hidden"
    );


    dfaTableBody.innerHTML =
        "";


    setStartModeBtn.classList.remove(
        "active"
    );


    setFinalModeBtn.classList.remove(
        "active"
    );


    testStringInput.value =
        "";


    stringResult.innerHTML =
        `Enter a string and click "Check String".`;


    stringPath.innerHTML =
        "";


    setStatus(
        "Everything cleared."
    );

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(message) {

    statusEl.textContent =
        message;

}


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    drawTransitions
);


/* =========================================================
   INITIALIZE
   ========================================================= */

updateStateSelects();

setStatus("Ready.");