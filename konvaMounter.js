import React, { createElement as h } from 'react';
import ReactDOM from 'react-dom';
import { Stage, Layer } from 'react-konva';

import appconfig from "./appconfig.js";

function evaluateProps($props, propsExprs) {
  const evaluated = {...propsExprs};
  Object.keys(propsExprs).forEach(key => {
    const propval = propsExprs[key];
    if (typeof propval === "object") {
      evaluated[key] = eval(propval.expr);
    }
  });
  return evaluated;
}

function transformToVDOM(config, $props) {
  let props = null;
  if (config.props) {
    props = evaluateProps($props, config.props);
  }
  const children = config.children.map(child => h(transformToVDOM(child, $props), { key: child.id }));
  return function() {
    return h(
      config.type,
      { 
        ...props,
        id: config.id
      },
      children
    );
  }
}

function App() {
  const konvaApp = h(transformToVDOM(appconfig))
  return h(
    Stage,
    {
      width: window.innerWidth,
      height: window.innerHeight
    },
    [
      h(
        Layer,
        {
          key: "layer1"
        },
        konvaApp
      )
    ]
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

