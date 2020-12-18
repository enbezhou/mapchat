// const greeter = require("./greeter");
// document.querySelector("#root").appendChild(greeter())

import React from 'react';
import { render } from 'react-dom';
import Greeterv2 from "./greeter-v2";
import './main.css';

render(<Greeterv2/>, document.getElementById('root'));
