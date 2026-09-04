const { board } = window.miro;

const escapeHtml = (str) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const framesToc = async () => {
  try {
    const selectedWidgets = await board.getSelection();

    if (selectedWidgets.length === 0) {
      await miro.board.notifications.showError("No frames selected. Select one or more frames and try again.");
      return;
    }

    const nonFrames = selectedWidgets.filter((item) => item.type !== "frame");

    if (nonFrames.length > 0) {
      await miro.board.notifications.showError("Only frames can be selected. Select one or more frames and try again.");
      return;
    }

    const frames = selectedWidgets; // all confirmed frames, order preserved from selection

    const boardInfo = await board.getInfo();
    const boardId = boardInfo.id;

    const listItems = frames.map((frame, index) => {
      const title = frame.title || "Untitled frame";
      const escapedTitle = escapeHtml(title);
      const number = index + 1;
      const href = `https://miro.com/app/board/${boardId}/?moveToWidget=${frame.id}&cot=14`;

      return `<li data-list="ordered" role="listitem" aria-label="${number}. ${escapedTitle}"><span aria-hidden="true" class="ql-ui" contenteditable="false" style="user-select: none;"></span><a href="${href}" rel="noopener noreferrer" target="_blank">${escapedTitle}</a></li>`;
    });

    const content = `<p>Frames Table of Contents</p><ol>${listItems.join("")}</ol>`;

    const right = Math.max(...frames.map((f) => f.x + f.width / 2));
    const bottom = Math.max(...frames.map((f) => f.y + f.height / 2));

    const MARGIN = 40;
    const TOC_WIDTH = 400;

    const newText = await board.createText({
      content,
      x: right + MARGIN + TOC_WIDTH / 2,
      y: bottom + MARGIN,
      width: TOC_WIDTH,
      style: {
        fillColor: "transparent",
        fillOpacity: 1,
        fontFamily: "noto_sans",
        fontSize: 14,
        textAlign: "left",
        color: "#1a1a1a",
      },
    });

    await board.deselect({ id: selectedWidgets.map((w) => w.id) });
    await board.select({ id: [newText.id] });
    await board.viewport.zoomTo([newText]);

    const currentViewport = await board.viewport.get();
    await board.viewport.set({
      viewport: currentViewport,
      padding: { top: 100, bottom: 100, left: 100, right: 100 },
      animationDurationInMs: 300,
    });

    await miro.board.notifications.showInfo(
      `Table of contents created with ${frames.length} frame${frames.length === 1 ? "" : "s"}.`
    );
  } catch (error) {
    console.error("Error executing Frames TOC Maker:", error);
    await miro.board.notifications.showError("An error occurred while trying to create the table of contents.");
  }
};