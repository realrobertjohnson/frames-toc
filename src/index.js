import { framesToc } from "./framesToc";

const init = () => {
  const { board } = window.miro;

  board.ui.on("icon:click", async () => {
    await framesToc();
  });
};

init();