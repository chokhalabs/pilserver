import React, { createElement as h, useState} from 'react';
import ReactDOM from 'react-dom';
import { Stage, Layer } from 'react-konva';

import appconfig from "./appconfig.js";
import expectedHandlers from "./toBeSuppliedByDevs.js";

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
  const expectedProps = {
    ...expectedHandlers
  };
  // Separate eventhandlers from binded values
  const bindedValues = {}, eventHandlers = {};
  Object.keys(expectedHandlers).forEach(key => {
    if (/^on[A-Z](.*)$/.test(key)) {
      eventHandlers[key] = expectedHandlers[key];
    } else {
      bindedValues[key] = expectedHandlers[key];
    }
  })
  // Put binded values in a state
  const [globalState, setGlobalState] = useState(bindedValues);
  // Pass setState to eventHandlers
  for (let key in eventHandlers) {
    eventHandlers[key] = (ev) => expectedHandlers[key](ev, globalState, setGlobalState)
  }
  // Then continue with generation of the dom
  const konvaApp = h(transformToVDOM(appconfig, { ...globalState, ...eventHandlers }))
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

