/**
 * FSM.js — Lightweight Finite State Machine
 * Used for Guard and Boss AI behavior management.
 *
 * Usage:
 *   const fsm = new FSM(owner, {
 *       PATROL: { enter(){}, update(dt){}, exit(){} },
 *       CHASE:  { enter(){}, update(dt){}, exit(){} },
 *   }, 'PATROL');
 */
class FSM {
    /**
     * @param {object} owner - The entity that owns this FSM
     * @param {object} states - Map of state name → { enter, update, exit }
     * @param {string} initialState - Starting state name
     */
    constructor(owner, states, initialState) {
        this.owner = owner;
        this.states = states;
        this.currentState = null;
        this.currentStateName = null;
        this.previousStateName = null;
        this.stateTime = 0;

        if (initialState) {
            this.setState(initialState);
        }
    }

    /**
     * Transition to a new state.
     * Calls exit() on old state and enter() on new state.
     * @param {string} stateName
     * @param {object} [params] - Optional data passed to enter()
     */
    setState(stateName, params) {
        if (this.currentStateName === stateName) return;

        const newState = this.states[stateName];
        if (!newState) {
            console.warn(`FSM: Unknown state "${stateName}"`);
            return;
        }

        // Exit current state
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit.call(this.owner);
        }

        this.previousStateName = this.currentStateName;
        this.currentStateName = stateName;
        this.currentState = newState;
        this.stateTime = 0;

        // Enter new state
        if (this.currentState.enter) {
            this.currentState.enter.call(this.owner, params);
        }
    }

    /**
     * Update the current state. Called every frame.
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        this.stateTime += dt * 1000; // track time in ms
        if (this.currentState && this.currentState.update) {
            this.currentState.update.call(this.owner, dt);
        }
    }

    /**
     * Check if currently in a specific state.
     * @param {string} stateName
     * @returns {boolean}
     */
    is(stateName) {
        return this.currentStateName === stateName;
    }

    /**
     * Get time spent in current state (in ms).
     * @returns {number}
     */
    getStateTime() {
        return this.stateTime;
    }
}
