import OBR, { Shape, Image } from "@owlbear-rodeo/sdk";
import { colors } from "./colors";
import { getPluginId } from "./getPluginId";
import {
  buildStatusRing,
  isPlainObject,
  updateColorButtons,
  updateStatusRingScales,
} from "./helpers";
import "./style.css";

/**
 * This file represents the HTML of the popover that is shown once
 * the status ring context menu item is clicked.
 */

OBR.onReady(async () => {
  // Setup the document with the colored buttons
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div class="colors">
      ${colors
        .map(
          (color) =>
            `
            <button class="color-button" id="${color}">
              <div class="color" style="background: ${color}"></div>
            </button>
            `
        )
        .join("")}
    </div>
  `;
  // Attach click listeners
  document
    .querySelectorAll<HTMLButtonElement>(".color-button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        handleButtonClick(button);
      });
    });

  // Update the button states with the current selection
  const allItems = await OBR.scene.items.getItems();
  updateColorButtons(allItems);
  // Add change listener for updating button states
  OBR.scene.items.onChange(updateColorButtons);
});

async function handleButtonClick(button: HTMLButtonElement) {
  // Get the color and selection state
  const color = button.id;
  const selected = button.classList.contains("selected");
  const selection = await OBR.player.getSelection();
  if (selection) {
    const circlesToAdd: Shape[] = [];
    const circlesToDelete: string[] = [];
    // Get all selected items
    const items = await OBR.scene.items.getItems<Image>(selection);
    // Get all status rings in the scene
    const statusRings = await OBR.scene.items.getItems<Shape>((item) => {
      const metadata = item.metadata[getPluginId("metadata")];
      return Boolean(isPlainObject(metadata) && metadata.enabled);
    });
    // Get the grid dpi so we can scale the rings
    const dpi = await OBR.scene.grid.getDpi();
    for (const item of items) {
      // Find all rings attached to this item
      const attachedRings = statusRings.filter(
        (ring) => ring.attachedTo === item.id
      );
      // Find all rings of the selected color attached to this item
      const currentColorRings = attachedRings.filter(
        (ring) => ring.style.strokeColor === color
      );
      // Delete the ring if it is selected else add a new ring
      if (selected) {
        circlesToDelete.push(...currentColorRings.map((ring) => ring.id));
      } else {
        circlesToAdd.push(
          buildStatusRing(item, color, dpi, 1 - attachedRings.length * 0.1)
        );
      }
    }
    if (circlesToAdd.length > 0) {
      await OBR.scene.items.addItems(circlesToAdd);
    }
    if (circlesToDelete.length > 0) {
      await OBR.scene.items.deleteItems(circlesToDelete);
      // After deleting a ring adjust the scale of the selected rings
      // so that we don't have any gaps
      await updateStatusRingScales(selection);
    }
  }
}
