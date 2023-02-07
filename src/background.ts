import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

import icon from "./status.svg";

/**
 * This file represents the background script run when the plugin loads.
 * It creates the context menu item for the status ring.
 */

OBR.onReady(() => {
  OBR.contextMenu.create({
    id: getPluginId("menu"),
    icons: [
      {
        icon,
        label: "Colored Rings",
        filter: {
          every: [
            { key: "type", value: "IMAGE" },
            { key: "layer", value: "CHARACTER" },
          ],
          permissions: ["UPDATE"],
        },
      },
    ],
    onClick(_, elementId) {
      OBR.popover.open({
        id: getPluginId("color-picker"),
        url: "/",
        height: 80,
        width: 200,
        anchorElementId: elementId,
      });
    },
  });
});
