/**
 * @file Given an array, run the given asynchronous task in parallel for each value of the array.
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

/**
 * Each
 *
 * @module each
 * @example
 * await the.each(array, { limit: 10 });
 *
 * @param {Array} array Array of items to run the asynchronous task with.
 * @param {Function} task The async function to be run on each value in the array
 * @param {Object} options Optional limit to # of tasks to run in parallel
 */
module.exports = (array = [], task, options = {}) => {
    // Keep track of all running tasks so we can enforce the limit option.
    let tasksRunning = [];
    // Keep track of the # of tasks we've completed successfully so we can tell when we're done.
    let numTasksCompleted = 0;
    // Keep an index into the values array so that each task gets a new value.
    let index = 0;
    // Declare a var to hold any error thrown by a task.
    let error = null;

    return new Promise(async (resolve, reject) => {
        // Keep running until all tasks are done, or an error is detected.
        while (numTasksCompleted < array.length && !error) {
            // We only start a new task if we're under our task limit or, if there is no limit,
            // we've still got tasks to run.
            if (
                ((!options.limit && tasksRunning.length < array.length) ||
                    tasksRunning.length < options.limit) &&
                numTasksCompleted + tasksRunning.length < array.length
            ) {
                // Grab a new value from the array.
                const value = array[index++];
                // Start running the task and push it into the `tasksRunning` array to keep track of it.
                tasksRunning.push(
                    task(value)
                        // If the task completes successfully, increment `numTasksCompleted` and pop it off
                        // the stack of tasks we're tracking.
                        .then(() => {
                            numTasksCompleted++;
                            tasksRunning.pop();
                        })
                        // If the task fails, set the error value which will bust out of the `while` loop above.
                        .catch(err => {
                            error = err;
                        })
                );
            }
            // Wait for the next run of the event loop to give tasks a chance to run.
            // Note the use of `setImmediate` rather than `nextTick`, which would block the loop if
            // any of the tasks had `setTimeout` in them.
            await new Promise(r => setImmediate(r));
        }

        // If a task returned an error, fail this promise.
        if (error) {
            return reject(error);
        }

        // Otherwise if we got here, all tasks completed successfully!
        return resolve();
    });
};
