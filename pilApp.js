import { AppBase } from "./pillBase";
import pil from "./pil.js";

const app = new AppBase();

export default {
  ...app,
  mount(canvas) {
    app.mount(canvas, pil.Item);
  }
};
