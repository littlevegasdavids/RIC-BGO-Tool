const db = require("../db");

module.exports = (io) => {
  io.on("connect", (socket) => {
    socket.on("getBusy", async (userInfo) => {
      let queue = [];
      let busy = [];

      const role_id = userInfo.role_id;

      if (role_id == 3) {
        const user_id = userInfo.user_id;

        const { rows } = await db.query(
          'SELECT * FROM public."Scenarios" WHERE scenario_status = 1 OR scenario_status = 2 OR scenario_status = 3 OR scenario_status = 6 AND user_id = $1',
          [user_id]
        );

        rows.forEach((row) => {
          switch (row.scenario_status) {
            //Busy
            case 1:
              busy.push(row);
              break;

            //Busy
            case 2:
              busy.push(row);
              break;

            //Busy
            case 3:
              busy.push(row);
              break;

            //Queue
            case 6:
              queue.push(row);
              break;
          }
        });
      } else {
        const { rows } = await db.query(
          'SELECT * FROM public."Scenarios" WHERE scenario_status = 1 OR scenario_status = 2 OR scenario_status = 3 OR scenario_status = 6'
        );

        rows.forEach((row) => {
          switch (row.scenario_status) {
            //Busy
            case 1:
              busy.push(row);
              break;

            //Busy
            case 2:
              busy.push(row);
              break;

            //Busy
            case 3:
              busy.push(row);
              break;

            //Queue
            case 6:
              queue.push(row);
              break;
          }
        });
      }

      socket.emit("receiveBusyScenarios", {
        queue: queue,
        busy: busy,
      });
    });
  });
};
