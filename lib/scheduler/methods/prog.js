/**
   * Set progress of parent process directly, or incrementally in a set amount of time.
   * @param {Number} [start] - Current progress amount, specified as a number between 0 and 1, or the starting value.
   * @param {Number} [end] - When specified, sets progress from the start value, finishing at the end value.
   * @param {Number} [second] - Amount of seconds to automatically set progress.
   * @example
   * prog 0.5       // progress is set to 0.5 (which means 50%)
   * prog 0 1 5     // progress is automatically set ranging from 0 to 1, in a matter of 5 seconds
   * prog           // restore automatic progress reporting
   */

exports.prog = dat => function (p, start, finish, milliseconds) {
  if (typeof start === 'undefined') {
    global.hybrixd.proc[p.parentID].autoprog = true;
  } else {
    global.hybrixd.proc[p.parentID].autoprog = false;
    if (!milliseconds) {
      global.hybrixd.proc[p.parentID].progress = start;
    } else {
      if (global.hybrixd.proc[p.parentID].timeout && milliseconds > global.hybrixd.proc[p.parentID].timeout) { milliseconds = global.hybrixd.proc[p.parentID].timeout; }
      if (finish >= 1) { finish = 1; }
      let increment = (finish - start) / (milliseconds * 0.002); // TODO unused
      let progressvalue;
      global.hybrixd.proc[p.parentID].progress = start;
      for (let i = 0; i <= (milliseconds * 0.002); i = i + 0.5) {
        progressvalue = start + (((finish - start) / (milliseconds * 2)) * i * 1000);
        if (progressvalue >= 1) { progressvalue = 0.999; }
        setTimeout(function () { // TODO rogue setTimeout. what happens if process stops or errors in between
          if (global.hybrixd.proc[this.parentID].progress < 1) {
            global.hybrixd.proc[this.parentID].progress = this.progressvalue;
          }
        }.bind({parentID: p.parentID, progressvalue: progressvalue}), i * 500);
      }
    }
  }
  this.next(p, 0, global.hybrixd.proc[p.processID].data);
};
