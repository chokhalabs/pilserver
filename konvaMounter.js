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
      if ($props[propval.expr.substring("$props.".length)]) {
        // evaluated[key] = eval(propval.expr);
        evaluated[key] = $props[propval.expr.substring("$props.".length)];
      } else {
        evaluated[key] = propval.default;
      }
    }
  });
  return evaluated;
}

function transformToVDOM(config, $props) {
  let props = null;
  let mappedProps = [];
  if (config.props) {
    props = evaluateProps($props, config.props);
    // If config has more than one mapped props then choose only one to map over and print an error 
    // telling that only one mapped prop is allowed per component
    mappedProps = Object.keys(props).filter(key => {
      const prop = (props || {})[key];
      return (typeof prop === "object") && prop.map;
    });
    if (mappedProps.length > 1) {
      console.error("There are multiple mapped props in the ccomponent which is not allowed!", config, $props, mappedProps);
    }
  }
  return function() {
    // If there is a mapped prop then return a group with one component per item in the mapped prop
    if (mappedProps.length === 0) {
      const children = config.children.map(child => h(transformToVDOM(child, $props), { key: child.id }));
      return h(
        config.type,
        { 
          ...props,
          id: config.id
        },
        children
      );
    } else {
      const mappedPropKey = mappedProps[0];
      const mappedProp = (props && props[mappedPropKey] || []);
      if (mappedProp.length === 0) {
        console.error("Did not get array in mappedProp!", mappedProp, mappedPropKey);
      }
      const children = config.children.map(child => h(transformToVDOM(child, $props), { key: child.id }));
      return mappedProp.map((item, i) => h(
        config.type,
        {
          ...props,
          [mappedPropKey]: item,
          id: config.id + i
        },
        children
      )) 
    }
  }
}

function App() {
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

