import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

const icon = new URL(
  "./status.svg#icon",
  import.meta.url,
).toString();

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
    embed: {
      url: "/",
      height: 88,
    },
  });
});
